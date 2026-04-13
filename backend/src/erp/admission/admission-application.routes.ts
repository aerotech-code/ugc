import { Router, Response } from "express";
import { authenticateToken } from "../../middleware/auth.middleware";
import { asyncHandler, createError } from "../../middleware/error.middleware";
import {
  requireAdmissionContext,
  AdmissionRequest
} from "./admission-context.middleware";
import {
  validateRequired,
  validateUUID
} from "../../middleware/validation.middleware";

import AdmissionApplicationModel from "./admission-application.model";

const router: Router = Router();

/* ------------------------------------------------ */
/* Response Helpers                                 */
/* ------------------------------------------------ */

const sendOk = (
  res: Response,
  data?: unknown,
  extras: Record<string, unknown> = {}
) => {
  res.status(200).json({
    status: "success",
    ...(data !== undefined && { data }),
    ...extras
  });
};

const sendCreated = (res: Response, data?: unknown) => {
  res.status(201).json({
    status: "success",
    ...(data !== undefined && { data })
  });
};

/* ------------------------------------------------ */
/* Context Helper                                   */
/* ------------------------------------------------ */

const getContext = (req: AdmissionRequest) => {
  if (!req.admissionContext) {
    throw createError("Admission context missing", 500);
  }

  return req.admissionContext;
};

/* ------------------------------------------------ */
/* Middleware                                       */
/* ------------------------------------------------ */

router.use(authenticateToken);
router.use(requireAdmissionContext);

/* ------------------------------------------------ */
/* Submit Application                               */
/* POST /api/admissions/applications                */
/* ------------------------------------------------ */

router.post(
  "/",
  asyncHandler(async (req: AdmissionRequest, res: Response) => {
    validateRequired(req.body.applicantName, "Applicant Name");
    validateRequired(req.body.applicantEmail, "Applicant Email");

    const application = await AdmissionApplicationModel.create(
      getContext(req),
      req.body,
      req.user!.id
    );

    sendCreated(res, application);
  })
);

/* ------------------------------------------------ */
/* List Applications                                */
/* GET /api/admissions/applications                 */
/* ------------------------------------------------ */

router.get(
  "/",
  asyncHandler(async (req: AdmissionRequest, res: Response) => {
    const result = await AdmissionApplicationModel.list(
      getContext(req),
      req.query as Record<string, unknown>
    );

    res.status(200).json({
      status: "success",
      ...result
    });
  })
);

/* ------------------------------------------------ */
/* Get Application by ID                            */
/* GET /api/admissions/applications/:id             */
/* ------------------------------------------------ */

router.get(
  "/:id",
  asyncHandler(async (req: AdmissionRequest, res: Response) => {
    const id = String(req.params.id);

    validateUUID(id, "Application ID");

    const application = await AdmissionApplicationModel.getById(
      getContext(req),
      id
    );

    sendOk(res, application);
  })
);

/* ------------------------------------------------ */
/* Get Application Status                           */
/* GET /api/admissions/applications/:id/status      */
/* ------------------------------------------------ */

router.get(
  "/:id/status",
  asyncHandler(async (req: AdmissionRequest, res: Response) => {
    const id = String(req.params.id);

    validateUUID(id, "Application ID");

    const status = await AdmissionApplicationModel.getStatus(
      getContext(req),
      id
    );

    sendOk(res, status);
  })
);

/* ------------------------------------------------ */
/* Update Application                               */
/* PUT /api/admissions/applications/:id             */
/* ------------------------------------------------ */

router.put(
  "/:id",
  asyncHandler(async (req: AdmissionRequest, res: Response) => {
    const id = String(req.params.id);

    validateUUID(id, "Application ID");

    const updatedApplication = await AdmissionApplicationModel.update(
      getContext(req),
      id,
      req.body,
      req.user!.id
    );

    sendOk(res, updatedApplication, {
      message: "Application updated successfully"
    });
  })
);

/* ------------------------------------------------ */
/* Delete / Withdraw Application                    */
/* DELETE /api/admissions/applications/:id          */
/* ------------------------------------------------ */

router.delete(
  "/:id",
  asyncHandler(async (req: AdmissionRequest, res: Response) => {
    const id = String(req.params.id);

    validateUUID(id, "Application ID");

    await AdmissionApplicationModel.delete(getContext(req), id);

    sendOk(res, undefined, {
      message: "Application deleted successfully"
    });
  })
);

export default router;