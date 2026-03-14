export class AppResponse {
  success: boolean;
  result: any;

  static create = (success: boolean, result: any) => {
    return {
      success,
      result,
    };
  };
}
