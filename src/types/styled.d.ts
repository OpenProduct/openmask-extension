import "styled-components";
interface IPalette {
  main: string;
  contrastText: string;
}
declare module "styled-components" {
  export interface DefaultTheme {
    background: string;
    color: string;

    darkGray: string;
    gray: string;
    lightGray: string;

    padding: string;
  }
}
