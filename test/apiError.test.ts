import { describe, expect, it } from "vitest";

import { ApiError, apiErrorMessage } from "../services/apiError";

describe("apiErrorMessage", () => {
  it("reads the message a thrown HttpException sent", () => {
    /* What the popup scheduler used to hide behind "sjekk at tidsrommet er
       ledig", regardless of what actually went wrong. */
    const error = new ApiError("failed", 409, "/popups", {
      statusCode: 409,
      message: "Tidsrommet overlapper en annen popup",
      error: "Conflict",
    });

    expect(apiErrorMessage(error)).toBe("Tidsrommet overlapper en annen popup");
  });

  it("joins the array ValidationPipe sends", () => {
    const error = new ApiError("failed", 400, "/popups", {
      statusCode: 400,
      message: [
        "startsAt must be a valid ISO 8601 date string",
        "title should not be empty",
      ],
      error: "Bad Request",
    });

    expect(apiErrorMessage(error)).toBe(
      "startsAt must be a valid ISO 8601 date string. title should not be empty",
    );
  });

  it("returns undefined when there is nothing worth showing", () => {
    expect(
      apiErrorMessage(new ApiError("failed", 500, "/popups")),
    ).toBeUndefined();
    expect(
      apiErrorMessage(
        new ApiError("failed", 500, "/popups", "<html>502</html>"),
      ),
    ).toBeUndefined();
    expect(
      apiErrorMessage(
        new ApiError("failed", 400, "/popups", { message: ["", "  "] }),
      ),
    ).toBeUndefined();
    expect(apiErrorMessage(new Error("offline"))).toBeUndefined();
  });
});
