import styled from "styled-components";

const scale = 1.65;
const purplishColor = "#8742cc";
const pinkishColor = "#a94a8c";
const palePinkColor = "#ECC8DD";
const bgColor = "#fffff";
const font = "Muli, sans-serif";

const Demo = styled.div`
  background: linear-gradient(
    45deg,
    lighten(${pinkishColor}, 10%),
    lighten(${purplishColor}, 10%)
  );
  min-height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 0;
  user-select: none;
  overflow: hidden;
  position: relative;

  demo__screen {
    position: relative;
    background-color: ${bgColor};
    overflow: hidden;
    flex-shrink: 0;
    &--clickable {
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }
  }

  demo__fprint-path {
    stroke-width: 2.5px;
    stroke-linecap: round;
    fill: none;
    stroke: white;
    visibility: hidden;
    transition: opacity 0.5s ease;
    will-change: stroke-dashoffset, stroke-dasharray;
    transform: translateZ(0);

    &--pinkish {
      stroke: ${pinkishColor};
    }

    &--purplish {
      stroke: ${purplishColor};
    }
  }

  demo__fprint {
    width: 180px * ${scale};
    height: 320px * ${scale};
    position: relative;
    top: 20px * ${scale};
    overflow: visible;
    background-image: url("/fprintBackground.svg");
    background-size: cover;
    &--no-bg {
      background-image: none;
    }
  }
`;

export const Fingerprint = () => {
  return (
    <Demo>
      <div className="demo__screen demo__screen--clickable">
        <svg className="demo__fprint" viewBox="0 0 180 320">
          <path
            className="demo__fprint-path demo__fprint-path--removes-backwards demo__fprint-path--pinkish"
            d="M46.1,214.3c0,0-4.7-15.6,4.1-33.3"
          />
          <path
            className="demo__fprint-path demo__fprint-path--removes-backwards demo__fprint-path--purplish"
            d="M53.5,176.8c0,0,18.2-30.3,57.5-13.7"
          />
          <path
            className="demo__fprint-path demo__fprint-path--removes-forwards demo__fprint-path--pinkish"
            d="M115.8,166.5c0,0,19.1,8.7,19.6,38.4"
          />
          <path
            className="demo__fprint-path demo__fprint-path--removes-backwards demo__fprint-path--pinkish"
            d="M47.3,221c0,0,3.1-2.1,4.1-4.6s-5.7-20.2,7-36.7c8.5-11,22.2-19,37.9-15.3"
          />
          <path
            className="demo__fprint-path demo__fprint-path--removes-forwards demo__fprint-path--pinkish"
            d="M102.2,165.4c10.2,2.7,19.5,10.4,23.5,20.2c6.2,15.2,4.9,27.1,4.1,39.4"
          />
          <path
            className="demo__fprint-path demo__fprint-path--removes-backwards demo__fprint-path--purplish"
            d="M51.1,226.5c3.3-2.7,5.1-6.3,5.7-10.5c0.5-4-0.3-7.7-0.3-11.7"
          />
          <path
            className="demo__fprint-path demo__fprint-path--removes-backwards demo__fprint-path--purplish"
            d="M56.3,197.9c3.1-16.8,17.6-29.9,35.1-28.8c17.7,1.1,30.9,14.9,32.8,32.2"
          />
          <path
            className="demo__fprint-path demo__fprint-path--removes-forwards demo__fprint-path--purplish"
            d="M124.2,207.9c0.5,9.3,0.5,18.7-2.1,27.7"
          />
          <path
            className="demo__fprint-path demo__fprint-path--removes-backwards demo__fprint-path--pinkish"
            d="M54.2,231.1c2.1-2.6,4.6-5.1,6.3-8c4.2-6.8,0.9-14.8,1.5-22.3c0.5-7.1,3.4-16.3,10.4-19.7"
          />
          <path
            className="demo__fprint-path demo__fprint-path--removes-backwards demo__fprint-path--purplish"
            d="M77.9,178.2c9.3-5.1,22.9-4.7,30.5,3.3"
          />
          <path
            className="demo__fprint-path demo__fprint-path--removes-forwards demo__fprint-path--purplish"
            d="M113,186.5c0,0,13.6,18.9,1,54.8"
          />
          <path
            className="demo__fprint-path demo__fprint-path--removes-backwards demo__fprint-path--pinkish"
            d="M57.3,235.2c0,0,5.7-3.8,9-12.3"
          />
          <path
            className="demo__fprint-path demo__fprint-path--removes-forwards demo__fprint-path--pinkish"
            d="M111.7,231.5c0,0-4.1,11.5-5.7,13.6"
          />
          <path
            className="demo__fprint-path demo__fprint-path--removes-backwards demo__fprint-path--purplish"
            d="M61.8,239.4c9.3-8.4,12.7-19.7,11.8-31.9c-0.9-12.7,3.8-20.6,18.5-21.2"
          />
          <path
            className="demo__fprint-path demo__fprint-path--removes-forwards demo__fprint-path--pinkish"
            d="M97.3,188.1c8.4,2.7,11,13,11.3,20.8c0.4,11.8-2.5,23.7-7.9,34.1c-0.1,0.1-0.1,0.2-0.2,0.3
          c-0.4,0.8-0.8,1.5-1.2,2.3c-0.5,0.8-1,1.7-1.5,2.5"
          />
          <path
            className="demo__fprint-path demo__fprint-path--removes-backwards demo__fprint-path--purplish"
            d="M66.2,242.5c0,0,15.3-11.1,13.6-34.9"
          />
          <path
            className="demo__fprint-path demo__fprint-path--removes-backwards demo__fprint-path--pinkish"
            d="M78.7,202.5c1.5-4.6,3.8-9.4,8.9-10.6c13.5-3.2,15.7,13.3,14.6,22.1"
          />
          <path
            className="demo__fprint-path demo__fprint-path--removes-forwards demo__fprint-path--pinkish"
            d="M102.2,219.7c0,0-1.7,15.6-10.5,28.4"
          />
          <path
            className="demo__fprint-path demo__fprint-path--removes-backwards demo__fprint-path--pinkish"
            d="M72,244.9c0,0,8.8-9.9,9.9-15.7"
          />
          <path
            className="demo__fprint-path demo__fprint-path--removes-forwards demo__fprint-path--pinkish"
            d="M84.5,223c0.3-2.6,0.5-5.2,0.7-7.8c0.1-2.1,0.2-4.6-0.1-6.8c-0.3-2.2-1.1-4.3-0.9-6.5c0.5-4.4,7.2-6.9,10.1-3.1
          c1.7,2.2,1.7,5.3,1.9,7.9c0.4,3.8,0.3,7.6,0,11.4c-1,10.8-5.4,21-11.5,29.9"
          />
          <path
            className="demo__fprint-path demo__fprint-path--removes-forwards demo__fprint-path--purplish"
            d="M90,201.2c0,0,4.6,28.1-11.4,45.2"
          />
          <path
            className="demo__fprint-path demo__fprint-path--pinkish"
            id="demo__elastic-path"
            d="M67.3,219C65,188.1,78,180.1,92.7,180.3c18.3,2,23.7,18.3,20,46.7"
          />
        </svg>
      </div>
    </Demo>
  );
};
