import { query } from '../../../db/postgres.js';
import type { AcademicsContext } from '../core/academics-context.middleware.js';

const HealthDashboardModel = {
  async getDashboardStats(context: AcademicsContext) {
    const semesters = await query(`SELECT COUNT(*) FROM academics_semesters WHERE institution_id = $1 AND academic_year = $2`, [context.institutionId, context.academicYear]);
    const finalExams = await query(`SELECT COUNT(*) FROM academics_final_exams WHERE institution_id = $1 AND academic_year = $2`, [context.institutionId, context.academicYear]);
    const results = await query(`SELECT COUNT(*) FROM academics_exam_results WHERE institution_id = $1 AND academic_year = $2 AND status = 'published'`, [context.institutionId, context.academicYear]);
    return {
      semesters_count: parseInt(semesters.rows[0].count, 10),
      final_exams_count: parseInt(finalExams.rows[0].count, 10),
      published_results_count: parseInt(results.rows[0].count, 10),
    };
  }
};

export default HealthDashboardModel;
