import { query } from '../../../db/postgres.js';
import { ApiError } from '../../../utils/apiError.js';

const SeatModel = {
  async getAvailability(courseId?: string, category?: string) {
    let sql = `
      SELECT c.id as course_id, c.course_name, c.total_seats, 
      (c.total_seats - COALESCE(s.allocated_count, 0)) as available_seats
      FROM admission_courses c
      LEFT JOIN (
        SELECT course_id, COUNT(*) as allocated_count 
        FROM seat_allocations 
        WHERE status IN ('allocated', 'upgraded')
        GROUP BY course_id
      ) s ON c.id = s.course_id
    `;
    const params = [];
    if (courseId) {
      sql += ` WHERE c.id = $1`;
      params.push(courseId);
    }
    const result = await query(sql, params);
    return result.rows;
  },

  async allocateSeat(appId: string, courseId: string, category: string) {
    // 1. Check availability
    const availability = await this.getAvailability(courseId);
    if (availability[0].available_seats <= 0) {
      throw new ApiError(400, 'No seats available for this course');
    }

    // 2. Check if already allocated
    const existing = await query(
      `SELECT id FROM seat_allocations WHERE application_id = $1`,
      [appId]
    );
    if (existing.rows.length > 0) {
      throw new ApiError(400, 'Seat already allocated for this applicant');
    }

    // 3. Allocate seat
    const result = await query(
      `INSERT INTO seat_allocations (application_id, course_id, category, status)
       VALUES ($1, $2, $3, 'allocated') RETURNING *`,
      [appId, courseId, category]
    );

    // 4. Update application status
    await query(
      `UPDATE admission_applications SET status = 'allocated' WHERE id = $1`,
      [appId]
    );

    return result.rows[0];
  },

  async getAllocationDetails(appId: string) {
    const result = await query(
      `SELECT s.*, c.course_name 
       FROM seat_allocations s
       JOIN admission_courses c ON s.course_id = c.id
       WHERE s.application_id = $1`,
      [appId]
    );
    if (result.rows.length === 0) throw new ApiError(404, 'No allocation found for this applicant');
    return result.rows[0];
  },

  async upgradeSeat(appId: string) {
    // logic for upgrade: usually based on higher preference course availability
    // for now, we'll just check if any other course has availability and upgrade to it (simplified)
    const current = await this.getAllocationDetails(appId);
    
    const betterOptions = await query(
      `SELECT id, course_name FROM admission_courses WHERE id != $1 LIMIT 1`,
      [current.course_id]
    );

    if (betterOptions.rows.length === 0) {
      throw new ApiError(400, 'No upgrade options available');
    }

    const upgradeCourse = betterOptions.rows[0];
    const availability = await this.getAvailability(upgradeCourse.id);

    if (availability[0].available_seats <= 0) {
      throw new ApiError(400, `No seats available in ${upgradeCourse.course_name} for upgrade`);
    }

    const result = await query(
      `UPDATE seat_allocations SET course_id = $1, status = 'upgraded' WHERE application_id = $2 RETURNING *`,
      [upgradeCourse.id, appId]
    );

    return { message: `Upgraded to ${upgradeCourse.course_name}`, allocation: result.rows[0] };
  },

  async cancelSeat(appId: string) {
    const result = await query(
      `DELETE FROM seat_allocations WHERE application_id = $1 RETURNING *`,
      [appId]
    );
    if (result.rowCount === 0) throw new ApiError(404, 'No allocation found to cancel');

    await query(
      `UPDATE admission_applications SET status = 'cancelled' WHERE id = $1`,
      [appId]
    );

    return { message: 'Seat allocation cancelled successfully' };
  },

  async getWaitlist() {
    // waitlist: merit listed but not allocated
    const result = await query(
      `SELECT a.id, a.applicant_name, a.score, m.rank, c.course_name
       FROM admission_applications a
       JOIN merit_list m ON a.id = m.application_id
       JOIN admission_courses c ON a.course_id = c.id
       LEFT JOIN seat_allocations s ON a.id = s.application_id
       WHERE s.id IS NULL
       ORDER BY m.rank ASC`
    );
    return result.rows;
  }
};

export default SeatModel;
