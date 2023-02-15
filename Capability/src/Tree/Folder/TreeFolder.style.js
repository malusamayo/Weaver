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

