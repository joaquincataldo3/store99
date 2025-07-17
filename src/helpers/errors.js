export const getMappedErrors = (errors) => {
    const errorsMapped = errors.mapped();
    const errorsParams = Object.keys(errorsMapped);
    return {
      errorsMapped,
      errorsParams
    };
  };