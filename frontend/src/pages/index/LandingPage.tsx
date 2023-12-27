import React from "react"
import { Link } from "react-router-dom"

import { clx } from "@/classnames"
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

const isOdd = (i: number) => i % 2 !== 0

const styles = {
  subtitle: "text-[3rem] font-bold md:text-left md:text-[4.5rem]",
} as const

function HomeContainer({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={clx("relative mx-auto my-0 max-w-[1024px]", className)}
      children={children}
    />
  )
}

function FeaturesContainer({ children }: { children: JSX.Element[] }) {
  return (
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line react/forbid-elements
    <section className="bg-[var(--color-primary)] p-4 text-white">
      <HomeContainer>
        <h2 className={styles.subtitle}>Features</h2>
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

function FeatureGrid({
  children,
  className,
}: {
  children: React.ReactNode
  className: string
}) {
  return (
    <li
      className={clx("flex gap-8 text-[2rem]", className)}
      children={children}
    />
  )
}

function Feature({ text, imageURL, index }: IFeatureProps) {
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line react/forbid-elements
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
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line react/forbid-elements
    <section className="px-4 pt-4">
      <HomeContainer className="grid">
        <h2 className={styles.subtitle}>How it works</h2>
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
      {/* TODO: Fix this the next time the file is edited. */}
      {/* eslint-disable-next-line react/forbid-elements */}
      <p className="self-center md:w-1/2">
        {/* TODO: Fix this the next time the file is edited. */}
        {/* eslint-disable-next-line react/forbid-elements */}
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

const LandingPage = () => {
  return (
    <NavPage includeSearch={false} noContainer>
      <HomeContainer className="grid gap-4 px-4 pb-4">
        {/* TODO: Fix this the next time the file is edited. */}
        {/* eslint-disable-next-line react/forbid-elements */}
        <section className="mb-2 flex justify-center">
          <h1 className="max-w-[900px] text-center text-[4rem] leading-[4rem]">
            A place to store, share, and create recipes
          </h1>
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
      {/* TODO: Fix this the next time the file is edited. */}
      {/* eslint-disable-next-line react/forbid-elements */}
      <section className="bg-gradient-to-b from-[var(--color-background)] from-50% to-[var(--color-primary)] to-50% px-4 pt-4">
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
