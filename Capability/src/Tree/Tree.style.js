import styled from "styled-components/macro";

export const StyledTree = styled.div`
  line-height: 1.75;
  z-index: 1;

  .tree__input {
    width: auto;
  }
`;

export const ActionsWrapper = styled.div`
  width: 100%;
  visibility: visible;
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  // justify-content: space-between;

  .actions {
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
    justify-content: space-between;
    opacity: 0;
    pointer-events: none;
    font-stretch: 100%;
    color: rgb(55, 55, 55);
    // transition: 0.2s;

    > svg {
      cursor: pointer;
      margin-left: 10px;
      transform: scale(1);
      transition: 0.2s;

      :hover {
        transform: scale(1.1);
      }
    }
  }

  &:hover .actions {
    opacity: 1;
    pointer-events: all;
    transition: 0.2s;
  }

  .special__actions {
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
    justify-content: space-between;
    opacity: 0;
    pointer-events: none;
    font-stretch: 100%;
    color: rgb(55, 55, 55);
    transition: 0.2s;

    > svg {
      cursor: pointer;
      margin-left: 10px;
      transform: scale(1);
      transition: 0.2s;
  }

`;

export const StyledName = styled.div`
  background-color: white;
  display: flex;
  align-items: center;
  cursor: pointer;
`;

export const StyledTag = styled.div`
  background-color: white;
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-left: 4px;
  font-size: 8px;
  font-weight: bold;
  border-radius: 4px;
  border: 2px solid;
  border-color: rgb(89, 89, 89);
  padding: 0px 4px 0px 4px;
  background-color: rgb(195, 195, 195);
`;

export const Collapse = styled.div`
  height: max-content;
  max-height: "100%";
  // overflow: hidden;
  // visibility: hidden;
  overflow: visible;
  transition: 0.01s ease-in-out;
`;

export const VerticalLine = styled.section`
  position: relative;
  :before {
    content: "";
    display: block;
    position: absolute;
    top: -2px; /* just to hide 1px peek */
    left: 1px;
    width: 0;
    height: 100%;
    border: 1px solid #dbdbdd;
    z-index: -1;
    opacity: ${(p) => (p.root ? "0" : "1")};
  }
`;
