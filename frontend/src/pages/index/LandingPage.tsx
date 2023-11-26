import React from "react"
import { Link } from "react-router-dom"

import { Button } from "@/components/Buttons"
import { Footer } from "@/components/Footer"
import { NavPage } from "@/components/Page"
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
    <section className="bg-[var(--color-primary)] pb-4 pl-4 pr-4 pt-4 text-white">
      <HomeContainer>
        <Subtitle>Features</Subtitle>
        <ul className="grid gap-4">{children}</ul>
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
  display: flex;
  font-size: 2rem;
  gap: 2rem;
`

function Feature({ text, imageURL, index }: IFeatureProps) {
  const description = <p className={`self-center md:w-1/2`}>{text}</p>
  const image = (
    <div className="self-center md:w-1/2">
      <img className="shadow" src={imageURL} alt="" />
    </div>
  )

  const [first, second] = isOdd(index)
    ? [image, description]
    : [description, image]
  return (
    <FeatureGrid
      key={text}
      className={
        isOdd(index)
          ? "flex-wrap-reverse md:flex-nowrap"
          : "flex-wrap md:flex-nowrap"
      }
    >
      {first}
      {second}
    </FeatureGrid>
  )
}

interface IHowItWorksContainerProps {
  readonly children: React.ReactNode
}
function HowItWorksContainer({ children }: IHowItWorksContainerProps) {
  return (
    <section className="pl-4 pr-4 pt-4">
      <HomeContainer className="grid">
        <h2 className="home-subtitle font-bold">How it works</h2>
        <ol className="grid gap-8">{children}</ol>
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
    <FeatureGrid key={imageURL} className={"flex-wrap md:flex-nowrap"}>
      <p className="self-center md:w-1/2">
        <b>
          {index + 1}
          {". "}
        </b>
        {content}
      </p>
      <div className="md:w-1/2">
        <img className="shadow " src={imageURL} alt="" />
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
        <Link className="underline" to={pathRecipeAdd({})}>
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
    <NavPage includeSearch={false} noContainer>
      <HomeContainer className="grid gap-4 pb-4 pl-4 pr-4">
        <section className="mb-2 flex justify-center">
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
      <section className="bg-50-50-primary bg-gradient-to-b from-[var(--color-background)] from-50% to-[var(--color-primary)] to-50% pl-4 pr-4 pt-4">
        <HomeContainer>
          <img className="shadow" src={landingImg} alt="" />
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
          className="mb-2 mt-4 justify-self-center"
        >
          Create Account
        </Button>
      </HowItWorksContainer>

      <Footer />
    </NavPage>
  )
}

export default LandingPage
