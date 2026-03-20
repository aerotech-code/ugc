import express from 'express'
import cookieParser from 'cookie-parser';
import cors from 'cors'
import erpRoutes from './routes/erp.routes.js';
import sandboxRoutes from './routes/sandbox.routes.js';
import applicationRoutes from './routes/application.routes.js';
import chatRoutes from './routes/chat.routes.js';
import userRoutes from './routes/user.routes.js';
import instituteRoutes from './routes/institute.routes.js';
import notesRoutes from './routes/notes.routes.js';
import feesRoutes from './erp/fees/fees.routes.js';
import academicsRoutes from './erp/academics/core/academics.routes.js';

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
}))

app.use(express.json({ limit: '16kb' }))
app.use(express.urlencoded({ extended: true, limit: '16kb' }))
app.use(express.static('public'))
app.use(cookieParser())

//routes import
// All route imports registered above

//routes declaration
app.use('/api/erp', erpRoutes);
app.use('/api/sandbox', sandboxRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/users', userRoutes);
app.use('/api/institute', instituteRoutes);
app.use('/api/v1/fees', feesRoutes);
app.use('/api/academics', academicsRoutes);
app.use('/api', notesRoutes);

export { app }