import "styled-components";
interface IPalette {
  main: string;
  contrastText: string;
}
declare module "styled-components" {
  export interface DefaultTheme {
    background: string;
    color: string;
    lightColor: string;

    darkGray: string;
    gray: string;
    lightGray: string;

    blueTon: string;
    darkBlue: string;
    blue: string;
    lightBlue: string;

    red: string;
    lightRed: string;

    orange: string;
    lightOrange: string;

    padding: string;
  }
}
