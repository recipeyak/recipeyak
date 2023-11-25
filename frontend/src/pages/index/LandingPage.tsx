import React from "react"
import { Link } from "react-router-dom"

import { Button } from "@/components/Buttons"
import { Footer } from "@/components/Footer"
import { pathRecipeAdd, pathSignup } from "@/paths"
import addRecipeImg from "@/static/images/pages/add-recipe.png"
import copyShoppingList from "@/static/images/pages/copy-shopping-list.png"
import landingImg from "@/static/images/pages/schedule.png"
import searchImg from "@/static/images/pages/search.png"
import shopImg from "@/static/images/pages/shop.png"
import teamImg from "@/static/images/pages/team.png"
import { styled } from "@/theme"

const isOdd = (i: number) => i % 2 !== 0

interface IFeaturesContainerProps {
  readonly children: JSX.Element[]
}

const Subtitle = styled.h2`
  font-weight: bold;
  font-size: 3rem;
  @media (min-width: 920px) {
    font-size: 4.5rem;
    text-align: left;
  }
`

const HomeContainer = styled.div`
  max-width: 1024px;
  margin: 0 auto;
  position: relative;
`

function FeaturesContainer({ children }: IFeaturesContainerProps) {
  return (
    <section className="bg-primary color-white pt-4 pb-4 pr-4 pl-4">
      <HomeContainer>
        <Subtitle>Features</Subtitle>
        <ul className="d-grid gap-1rem">{children}</ul>
      </HomeContainer>
    </section>
  )
}

interface IFeatureProps {
  readonly text: string
  readonly imageURL: string
  readonly index: number
}

const FeatureGrid = styled.li`
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(1, 1fr);
  font-size: 2rem;

  @media (min-width: 841px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 841px) {
    .grid-column-2 {
      grid-column: unset;
    }
    .grid-row-1 {
      grid-row: unset;
    }
  }
`

function Feature({ text, imageURL, index }: IFeatureProps) {
  return (
    <FeatureGrid key={text}>
      <p
        className={`align-self-center ${
          isOdd(index) ? "grid-column-2 grid-row-1" : ""
        }`}
      >
        {text}
      </p>
      <div className="fact-img align-self-center ">
        <img className="box-shadow-normal " src={imageURL} alt="" />
      </div>
    </FeatureGrid>
  )
}

interface IHowItWorksContainerProps {
  readonly children: React.ReactNode
}
function HowItWorksContainer({ children }: IHowItWorksContainerProps) {
  return (
    <section className="pt-4 pr-4 pl-4">
      <HomeContainer className="d-grid">
        <h2 className="home-subtitle bold">How it works</h2>
        <ol className="d-grid gap-2rem">{children}</ol>
      </HomeContainer>
    </section>
  )
}
interface IHowToProps {
  readonly content: React.ReactNode
  readonly imageURL: string
  readonly index: number
}

function HowTo({ content, index, imageURL }: IHowToProps) {
  return (
    <FeatureGrid key={imageURL}>
      <p className="align-self-center">
        <b>
          {index + 1}
          {". "}
        </b>
        {content}
      </p>
      <div className="fact-img">
        {/* tslint:disable-next-line:no-unsafe-any */}
        <img className="box-shadow-normal " src={imageURL} alt="" />
      </div>
    </FeatureGrid>
  )
}

const features = [
  {
    text: "Full text recipe search. Easily find recipes by ingredient, author, and name.",
    imgURL: searchImg,
  },
  {
    text: "Collaborate using Recipe Yak Teams to create a shared recipe schedule and shopping list.",
    imgURL: teamImg,
  },
  {
    text: "Automatically generate a condensed shopping list when selecting days to shop.",
    imgURL: copyShoppingList,
  },
]

const howToSteps = [
  {
    text: (
      <span>
        After logging in, add your recipes via the{" "}
        <Link className="text-decoration-underline" to={pathRecipeAdd({})}>
          add recipe
        </Link>{" "}
        form.
      </span>
    ),
    imgURL: addRecipeImg,
  },
  {
    text: (
      <span>
        Navigate to the schedule page and add drag recipes onto your calendar.
      </span>
    ),
    imgURL: landingImg,
  },
  {
    text: (
      <span>
        Navigate to the shopping list and adjust the days you are shopping for.
      </span>
    ),
    imgURL: shopImg,
  },
  {
    text: (
      <span>
        Copy the automatically generated shopping list with one click.
      </span>
    ),
    imgURL: copyShoppingList,
  },
]

const HeroText = styled.h1`
  text-align: center;
  font-size: 4rem;
  line-height: 4rem;
  // chosen empirically
  max-width: 900px;
`

const LandingPage = () => {
  return (
    <div>
      <HomeContainer className="d-grid gap-1rem pb-4 pr-4 pl-4">
        <section className="d-flex justify-content-center mb-2">
          <HeroText>A place to store, share, and create recipes</HeroText>
        </section>

        <Button
          to={pathSignup({})}
          variant="primary"
          size="large"
          className="justify-self-center"
        >
          Create Account
        </Button>
      </HomeContainer>
      <section className="pt-4 bg-50-50-primary pr-4 pl-4">
        <HomeContainer>
          {/* tslint:disable-next-line:no-unsafe-any */}
          <img className="box-shadow-normal" src={landingImg} alt="" />
        </HomeContainer>
      </section>

      <FeaturesContainer>
        {features.map(({ text, imgURL }, i) => (
          <Feature key={imgURL} text={text} imageURL={imgURL} index={i} />
        ))}
      </FeaturesContainer>

      <HowItWorksContainer>
        {howToSteps.map(({ text, imgURL }, i) => (
          <HowTo key={imgURL} content={text} imageURL={imgURL} index={i} />
        ))}

        <Button
          to={pathSignup({})}
          variant="primary"
          size="large"
          className="justify-self-center mt-4 mb-2"
        >
          Create Account
        </Button>
      </HowItWorksContainer>

      <Footer />
    </div>
  )
}

export default LandingPage
