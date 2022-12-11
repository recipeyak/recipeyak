import { ChevronLeft, ChevronRight, X } from "react-feather"

import { ButtonSecondary } from "@/components/Buttons"
import { styled } from "@/theme"

const MyGalleryContainer = styled.div`
  opacity: 1 !important;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`

const MyGalleryImg = styled.img`
  max-height: 100%;
  max-width: 100%;
  margin: auto;
`

const MyGalleryImgContainer = styled.div`
  display: flex;
  height: 100%;
`

const MyGalleryScrollWrap = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`

const MyGalleryBackground = styled.div`
  opacity: 0.8;
  background: #000;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`

const MyNextButton = styled(ButtonSecondary)`
  background: rgba(0, 0, 0, 0.46);
  color: white;
  border-style: none;
  backdrop-filter: blur(10px);
`

const MyGalleryControlOverlay = styled.div`
  position: absolute;

  top: 0;
  height: 100%;
  width: 100%;
  display: grid;
  flex-direction: column;
  padding: 0.5rem;
`

const NavButtonRow = styled.div`
  display: flex;
  margin-top: auto;
  margin-bottom: auto;
  justify-content: space-between;

  width: 100%;
  grid-area: 1/1;
`

const TopRow = styled.div`
  display: flex;
  margin-bottom: auto;
  justify-content: space-between;

  width: 100%;
  grid-area: 1/1;
`

const PageCount = styled.div`
  padding: 0 1rem;
  background: rgba(0, 0, 0, 0.46);
  padding: 0.2rem 0.5rem;
  color: white;
  height: fit-content;
  backdrop-filter: blur(2px);
`

export const Gallery = (props: { onClose: () => void }) => {
  return (
    <MyGalleryContainer>
      <MyGalleryBackground />
      <MyGalleryScrollWrap>
        <MyGalleryImgContainer>
          <MyGalleryImg src="https://images-cdn.recipeyak.com/57/ef4260f8c8754d6ea88f009c2cc404e4/05194136-A046-4155-94F0-29C00EB3D7E5.jpeg" />
        </MyGalleryImgContainer>
        <MyGalleryControlOverlay>
          <TopRow>
            <PageCount className="br-6">1 / 8</PageCount>
            <MyNextButton onClick={props.onClose}>
              <X />
            </MyNextButton>
          </TopRow>
          <NavButtonRow>
            <MyNextButton>
              <ChevronLeft />
            </MyNextButton>
            <MyNextButton>
              <ChevronRight />
            </MyNextButton>
          </NavButtonRow>
        </MyGalleryControlOverlay>
      </MyGalleryScrollWrap>
    </MyGalleryContainer>
  )
}
