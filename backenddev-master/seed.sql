INSERT INTO academics_semesters (id, institution_id, academic_year, name, status, start_date, end_date)
VALUES ('7a1f592a-3507-4e52-af39-86987c88b9ea', '1f3e4b10-e547-4952-b135-15a99564e525', '2023-2024', 'Fall 2023', 'active', '2023-09-01', '2023-12-15')
ON CONFLICT DO NOTHING;

INSERT INTO academics_semester_registrations (semester_id, student_id, student_name)
VALUES ('7a1f592a-3507-4e52-af39-86987c88b9ea', '550e8400-e29b-41d4-a716-446655440000', 'John Doe (Dummy Data)')
ON CONFLICT DO NOTHING;

INSERT INTO academics_internal_exams (id, institution_id, academic_year, semester_id, course_id, name, max_marks, passing_marks)
VALUES ('8ccfbea8-6fdb-4659-9f4a-89aecd8566ff', '1f3e4b10-e547-4952-b135-15a99564e525', '2023-2024', '7a1f592a-3507-4e52-af39-86987c88b9ea', '3b4f61e0-fc6b-4b2a-8eb4-d8bc4c1f6b88', 'Midterm 1', 50.00, 20.00)
ON CONFLICT DO NOTHING;

INSERT INTO academics_final_exams (id, institution_id, academic_year, semester_id, course_id, name, exam_date, max_marks, passing_marks)
VALUES ('9ddbcea9-7fbc-4760-af5b-90bfde967700', '1f3e4b10-e547-4952-b135-15a99564e525', '2023-2024', '7a1f592a-3507-4e52-af39-86987c88b9ea', '3b4f61e0-fc6b-4b2a-8eb4-d8bc4c1f6b88', 'Final Exam', '2023-12-10', 100.00, 40.00)
ON CONFLICT DO NOTHING;
