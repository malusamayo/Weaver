import styled from "styled-components/macro";

export const StyledFolder = styled.section`
  // font-weight: bold;
  // font-size: 13pt;
  font-stretch: 100%;
  // set the color of the folder name
  color: rgb(55, 55, 55);
  padding-left: ${(p) => p.theme.indent}px;
  .tree__file {
    padding-left: ${(p) => p.theme.indent}px;
  }
`;

export const NumberCircle = styled.div`
  border-radius: 50%;
  width: 15px;
  height: 15px;
  // padding: 8px;

  background: #fff;
  border: 2px solid #666;
  color: #666;
  text-align: center;

  // font: 32px Arial, sans-serif;
`