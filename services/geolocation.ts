export enum ErrorType {
  NATIVE_ERROR,
  UNSUPPORTED_BROWSER = "Geolocation is not supported by this browser.",
}

export async function getGeolocation() {
  return new Promise<GeolocationPosition>((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          return resolve(position);
        },
        (error) => {
          return reject({
            type: ErrorType.NATIVE_ERROR,
            message: error.message,
            native_code: error.code,
          });
        },
      );
    } else {
      return reject({
        type: ErrorType.UNSUPPORTED_BROWSER,
        message: "Geolocation is not supported by this browser.",
      });
    }
  });
}
