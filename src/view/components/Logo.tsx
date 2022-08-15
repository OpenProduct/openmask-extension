import { FC, useState } from "react";
import styled, { css, keyframes } from "styled-components";

// const spinX = keyframes`
// from { transform: rotateX(0); }
// to { transform: rotateX(360deg); }
// `;

// const spinY = keyframes`
// from { transform: rotateY(0); }
// to { transform: rotateY(360deg); }
// `;

// const spinZ = keyframes`
// from { transform: rotateZ(0); }
// to { transform: rotateZ(360deg); }
// `;

const loadingRight = keyframes`
0% {   transform: rotateZ(0); }
20% {  transform: rotateZ(360deg); }
100% { transform: rotateZ(360deg); }
`;

const loadingLeft = keyframes`
0% {   transform: rotateZ(0); }
20% {  transform: rotateZ(-360deg); }
100% { transform: rotateZ(-360deg); }
`;

const lighting = keyframes`
0% {   border-bottom-color:#33AFFF; }
50% {  border-bottom-color:#BBE8FF; }
100% { border-bottom-color:#33AFFF; }
`;

const lightingLighter = keyframes`
0% {   border-bottom-color:#72C8FF; }
50% {  border-bottom-color:#99EAFF; }
100% { border-bottom-color:#72C8FF; }
`;

const Wrap = styled.div`
  position: absolute;
  width: 0px;
  height: 0px;
  top: 50%;
  left: 50%;
  transform-origin: 0 0;
  transform-style: preserve-3d;
  overflow: visible;
`;

const WrapRotorX = styled(Wrap)`
  transform: rotateX(65deg);
`;

const WrapRotorY = styled(Wrap)<{ isLoading: boolean; isLeft: boolean }>`
    ${(props) =>
      props.isLoading && props.isLeft
        ? css`
            animation: ${loadingLeft} 3s infinite linear;
          `
        : css`
            animation: ${loadingRight} 3s infinite linear;
          `}}
`;

const WrapRotorZ = styled(Wrap)``;

const Triangle = styled.div`
  position: absolute;
  left: -100px;
  top: -30px;
  width: 0;
  height: 0;
  border-left: 100px solid transparent;
  border-right: 100px solid transparent;
  border-bottom: 100px solid #33afff;
  animation: ${lighting} 12s infinite linear;
`;

const TriangleBottom = styled(Triangle)`
  transform-origin: 50% 0%;
`;

const bottomFaces = Array.from(
  { length: 8 },
  (_, i) => styled(TriangleBottom)`
    animation-delay: -${2500 + i * 1000}ms;
    transform: translateY(90px) rotateY(${45 * i}deg) rotateX(35deg)
      scaleX(0.24) scaleY(-1);
  `
);

const TriangleMiddleBottom = styled(Triangle)`
  transform-origin: 50% 0%;
`;

const middleBottomFaces = Array.from(
  { length: 8 },
  (_, i) => styled(TriangleMiddleBottom)`
    animation-delay: -${3500 + i * 1000}ms;
    transform: rotateY(${45 * i}deg) translateY(-11px) translateZ(-34px)
      rotateX(-50deg) scaleX(0.24) scaleY(0.3);
  `
);

const TriangleMiddleTop = styled(Triangle)`
  transform-origin: 50% 100%;
`;

const middleTopFaces = Array.from(
  { length: 8 },
  (_, i) => styled(TriangleMiddleTop)`
    animation-delay: -${2500 + i * 1000}ms;
    transform: rotateY(${22.5 + 45 * i}deg) translateY(-111px) translateZ(-31px)
      rotateX(-58deg) scaleX(0.13) scaleY(-0.36);
  `
);

const TriangleUp = styled(Triangle)`
  animation: ${lightingLighter} 12s infinite linear;
  transform-origin: 50% 0%;
`;

const upFaces = Array.from(
  { length: 8 },
  (_, i) => styled(TriangleUp)`
    animation-delay: -${3500 + i * 1000}ms;
    transform: rotateY(${22.5 + 45 * i}deg) translateY(-22px) translateZ(0px)
      rotateX(-70deg) scaleX(0.13) scaleY(0.33);
  `
);

const Faces = bottomFaces
  .concat(middleBottomFaces)
  .concat(middleTopFaces)
  .concat(upFaces);

export const Logo: FC<{ isLoading?: boolean; isLeft?: boolean }> = ({
  isLoading = false,
  isLeft = false,
}) => {
  return (
    <WrapRotorX>
      <WrapRotorY isLoading={isLoading} isLeft={isLeft}>
        <WrapRotorZ>
          {Faces.map((Face, i) => (
            <Face key={i} />
          ))}
        </WrapRotorZ>
      </WrapRotorY>
    </WrapRotorX>
  );
};

const Block = styled.div`
  position: relative;
  width: 100%;
  height: 130px;
`;

export const LoadingLogo = () => {
  const [loading, setLoading] = useState(false);
  const [left, setLeft] = useState(true);

  const onLoading = () => {
    setLeft(Math.random() > 0.5);
    setLoading(true);
  };

  return (
    <Block onMouseEnter={onLoading} onMouseLeave={() => setLoading(false)}>
      <Logo isLoading={loading} isLeft={left} />
    </Block>
  );
};
