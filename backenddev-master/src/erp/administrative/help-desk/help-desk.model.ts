import { query } from '../../../db/postgres.js';
import { ApiError } from '../../../utils/apiError.js';

export interface HelpDeskTicket {
  id: string;
  raised_by: string;
  category: string;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  created_at: Date;
}

export const HelpDeskModel = {
  async createTicket(data: Omit<HelpDeskTicket, 'id' | 'status' | 'created_at'>): Promise<HelpDeskTicket> {
    const result = await query(
      `INSERT INTO help_desk_tickets (raised_by, category, subject, description, priority, status)
       VALUES ($1, $2, $3, $4, $5, 'open')
       RETURNING *`,
      [data.raised_by, data.category, data.subject, data.description, data.priority]
    );
    return result.rows[0];
  },

  async getAllTickets(): Promise<HelpDeskTicket[]> {
    const result = await query(
      'SELECT id, raised_by, category, subject, status, priority, created_at FROM help_desk_tickets ORDER BY created_at DESC'
    );
    return result.rows;
  },

  async getTicketById(id: string): Promise<HelpDeskTicket> {
    const result = await query(
      'SELECT id, raised_by, category, subject, status, priority, created_at FROM help_desk_tickets WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      throw new ApiError(404, 'Ticket not found');
    }
    return result.rows[0];
  },

  async updateTicketStatus(id: string, updates: Partial<Pick<HelpDeskTicket, 'status' | 'category' | 'subject' | 'description' | 'priority'>>): Promise<HelpDeskTicket> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        fields.push(`${key} = $${paramCount++}`);
        values.push(value);
      }
    }

    if (fields.length === 0) {
      throw new ApiError(400, 'No updates provided');
    }

    values.push(id);
    const result = await query(
      `UPDATE help_desk_tickets SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      throw new ApiError(404, 'Ticket not found');
    }
    return result.rows[0];
  }
};

export default HelpDeskModel;
