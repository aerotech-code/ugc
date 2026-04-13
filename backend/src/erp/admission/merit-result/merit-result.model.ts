import { query } from '../../../db/postgres.js';
import { ApiError } from '../../../utils/apiError.js';

const MeritModel = {
  async generateMeritList(courseId: string) {
    // 1. Delete existing merit list for the course if not published
    await query(
      `DELETE FROM merit_list WHERE course_id = $1 AND is_published = FALSE`,
      [courseId]
    );

    // 2. Fetch applications for the course sorted by score
    const applications = await query(
      `SELECT id, score, category FROM admission_applications WHERE course_id = $1 ORDER BY score DESC`,
      [courseId]
    );

    // 3. Insert into merit list with rank
    const insertPromises = applications.rows.map((app, index) => {
      return query(
        `INSERT INTO merit_list (application_id, course_id, score, rank, category)
         VALUES ($1, $2, $3, $4, $5)`,
        [app.id, courseId, app.score, index + 1, app.category]
      );
    });

    await Promise.all(insertPromises);
    return { message: `Merit list generated for course ${courseId}` };
  },

  async listMeritList(page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;
    const result = await query(
      `SELECT m.id, a.applicant_name, a.email, m.rank, m.score, m.category, m.is_published 
       FROM merit_list m
       JOIN admission_applications a ON m.application_id = a.id
       ORDER BY m.rank ASC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return result.rows;
  },

  async getRank(appId: string) {
    const result = await query(
      `SELECT rank FROM merit_list WHERE application_id = $1`,
      [appId]
    );
    if (result.rows.length === 0) throw new ApiError(404, 'Applicant not found in merit list');
    return result.rows[0];
  },

  async publishMeritList() {
    await query(`UPDATE merit_list SET is_published = TRUE`);
    return { message: 'Merit list published successfully' };
  },

  async getCutoff() {
    const result = await query(
      `SELECT category, MIN(score) as cutoff_marks 
       FROM merit_list 
       WHERE is_published = TRUE
       GROUP BY category`
    );
    return result.rows;
  },

  async getStatus(appId: string) {
    const result = await query(
      `SELECT a.applicant_name, m.rank, m.is_published, 
       (CASE WHEN m.rank <= (SELECT total_seats FROM admission_courses WHERE id = a.course_id) THEN 'Shortlisted' ELSE 'Not Shortlisted' END) as status
       FROM admission_applications a
       LEFT JOIN merit_list m ON a.id = m.application_id
       WHERE a.id = $1`,
      [appId]
    );
    if (result.rows.length === 0) throw new ApiError(404, 'Applicant not found');
    return result.rows[0];
  }
};

export default MeritModel;
