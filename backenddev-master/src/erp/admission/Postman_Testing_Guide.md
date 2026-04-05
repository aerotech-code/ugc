# Postman Testing Guide - Admission APIs

Use this guide to test the newly implemented Admission Merit and Seat Allocation APIs.

## Base URL
`http://localhost:4000/api/admissions`

## 1. Merit Result APIs

### Generate Merit List
- **Method:** `POST`
- **Endpoint:** `/merit/generate`
- **Body:**
```json
{
  "courseId": "COURSE_UUID_HERE"
}
```
*(Note: Use a Course ID from the `admission_courses` table. Seed data includes 'Computer Science', 'Electronics', 'Mechanical')*

### List Merit List
- **Method:** `GET`
- **Endpoint:** `/merit/list?page=1&limit=10`

### Get Merit Rank
- **Method:** `GET`
- **Endpoint:** `/merit/{appId}/rank`

### Publish Merit List
- **Method:** `PUT`
- **Endpoint:** `/merit/publish`

### Get Cutoff Marks
- **Method:** `GET`
- **Endpoint:** `/merit/cutoff`

### Check Admission Status
- **Method:** `GET`
- **Endpoint:** `/merit/{appId}/status`

---

## 2. Seat Allocation APIs

### Get Seat Availability
- **Method:** `GET`
- **Endpoint:** `/seats/availability?courseId=COURSE_UUID_HERE`

### Allocate Seat
- **Method:** `POST`
- **Endpoint:** `/seats/allocate`
- **Body:**
```json
{
  "appId": "APP_UUID_HERE",
  "courseId": "COURSE_UUID_HERE",
  "category": "General"
}
```

### Get Allocation Details
- **Method:** `GET`
- **Endpoint:** `/seats/{appId}/allocation`

### Request Seat Upgrade
- **Method:** `PUT`
- **Endpoint:** `/seats/{appId}/upgrade`

### Cancel Allocated Seat
- **Method:** `DELETE`
- **Endpoint:** `/seats/{appId}/cancel`
                        
### Get Waitlist Status
- **Method:** `GET`
- **Endpoint:** `/seats/waitlist`

---

## Sample Data (from `admission_schema.sql`)

### Courses:
- Computer Science (50 seats)
- Electronics (40 seats)
- Mechanical (30 seats)

### Applicants:
- John Doe (85.5)
- Jane Smith (92.0)
- Alice Johnson (78.5)
- Bob Brown (88.0)
