import React from "react"
import { Link } from "react-router-dom"
import Footer from "@/components/Footer"

// tslint:disable:no-var-requires
const addRecipeImg = require("@/static/images/pages/add-recipe.png")
const landingImg = require("@/static/images/pages/schedule.png")
const teamImg = require("@/static/images/pages/team.png")
const searchImg = require("@/static/images/pages/search.png")
const shopImg = require("@/static/images/pages/shop.png")
const copyShoppingList = require("@/static/images/pages/copy-shopping-list.png")
// tslint:enable:no-var-requires

const isOdd = (i: number) => i % 2 !== 0

interface IFeaturesContainerProps {
  readonly children: JSX.Element[]
}

function FeaturesContainer({ children }: IFeaturesContainerProps) {
  return (
    <section className="bg-primary color-white pt-4 pb-4 pr-4 pl-4">
      <section className="home-container">
        <h2 className="home-subtitle bold">Features</h2>
        <ul className="d-grid grid-gap-1rem">{children}</ul>
      </section>
    </section>
  )
}

interface IFeatureProps {
  readonly text: string
  readonly imageURL: string
  readonly index: number
}

function Feature({ text, imageURL, index }: IFeatureProps) {
  return (
    <li className="feature-grid" key={text}>
      <p
        className={`align-self-center ${
          isOdd(index) ? "grid-column-2 grid-row-1" : ""
        }`}>
        {text}
      </p>
      <div className="fact-img align-self-center ">
        <img className="box-shadow-normal " src={imageURL} alt="" />
      </div>
    </li>
  )
}

interface IHowItWorksContainerProps {
  readonly children: React.ReactNode
}
function HowItWorksContainer({ children }: IHowItWorksContainerProps) {
  return (
    <section className="pt-4 pr-4 pl-4">
      <section className="home-container d-grid">
        <h2 className="home-subtitle bold">How it works</h2>
        <ol className="d-grid grid-gap-2rem">{children}</ol>
      </section>
    </section>
  )
}
interface IHowToProps {
  readonly content: React.ReactNode
  readonly imageURL: string
  readonly index: number
}

function HowTo({ content, index, imageURL }: IHowToProps) {
  // tslint:disable-next-line:no-unsafe-any
  return (
    <li className="feature-grid" key={imageURL}>
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
    </li>
  )
}

const features = [
  {
    text:
      "Full text recipe search. Easily find recipes by ingredient, author, and name.",
    imgURL: searchImg
  },
  {
    text:
      "Collaborate using Recipe Yak Teams to create a shared recipe schedule and shopping list.",
    imgURL: teamImg
  },
  {
    text:
      "Automatically generate a condensed shopping list when selecting days to shop.",
    imgURL: copyShoppingList
  }
]

const howToSteps = [
  {
    text: (
      <span>
        After logging in, add your recipes via the{" "}
        <Link className="text-decoration-underline" to="/recipes/add">
          add recipe
        </Link>{" "}
        form.
      </span>
    ),
    imgURL: addRecipeImg
  },
  {
    text: (
      <span>
        Navigate to the{" "}
        <Link to="/schedule" className="text-decoration-underline">
          schedule page
        </Link>{" "}
        and add drag recipes onto your calendar.
      </span>
    ),
    imgURL: landingImg
  },
  {
    text: (
      <span>
        Navigate to the{" "}
        <Link to="/schedule/shopping" className="text-decoration-underline">
          shopping list
        </Link>{" "}
        and adjust the days you are shopping for.
      </span>
    ),
    imgURL: shopImg
  },
  {
    text: (
      <span>
        Copy the automatically generated shopping list with one click.
      </span>
    ),
    imgURL: copyShoppingList
  }
]

const LandingPage = () => (
  <>
    <section className="home-container d-grid grid-gap-1rem pb-4 pr-4 pl-4">
      <section className="d-flex justify-content-center mb-2">
        <h1 className="home-hero-text">
          A place to store, share, and create recipes
        </h1>
      </section>

      <Link
        to="/signup"
        className="my-button is-primary is-large justify-self-center">
        Create Account
      </Link>
    </section>
    <section className="pt-4 bg-50-50-primary pr-4 pl-4">
      <section className="home-container">
        {/* tslint:disable-next-line:no-unsafe-any */}
        <img className="box-shadow-normal" src={landingImg} alt="" />
      </section>
    </section>

    <FeaturesContainer>
      {features.map(({ text, imgURL }, i) => (
        // tslint:disable-next-line:no-unsafe-any
        <Feature text={text} imageURL={imgURL} index={i} />
      ))}
    </FeaturesContainer>

    <HowItWorksContainer>
      {howToSteps.map(({ text, imgURL }, i) => (
        // tslint:disable-next-line:no-unsafe-any
        <HowTo content={text} imageURL={imgURL} index={i} />
      ))}

      <Link
        to="/signup"
        className="my-button is-primary is-large justify-self-center mt-4 mb-2">
        Create Account
      </Link>
    </HowItWorksContainer>

    <Footer />
  </>
)

export default LandingPage
