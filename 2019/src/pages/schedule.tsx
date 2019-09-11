import React from "react"
import styled from "styled-components"
import { useTranslation } from "react-i18next"
import { useStaticQuery, graphql } from "gatsby"

import { Layout } from "../components/Layout"
import { SEO } from "../components/Seo"
import { Title } from "../components/Title"
import { SubTitle as _SubTitle } from "../components/SubTitle"
import { ResponsiveBox } from "../components/ResponsiveBox"
import { Breadcrumb } from "../components/Breadcrumb"
import { LinkButton } from "../components/LinkButton"
import { SmoothScroll } from "../components/SmoothScroll"
import { TalkType, SpeakerType } from "../components/Speaker"
import { generateTimetable } from "../util/generateTimetable"

const DaysButtonBox = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;

  ${({ theme }) => theme.breakpoints.mobile} {
    flex-direction: column;
  }
`
const SubTitle = styled(_SubTitle)`
  text-align: left;
  margin-top: 20px;
  padding: 0.2em 1em;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`
const TimeBox = styled.div`
  display: grid;
  width: 100%;
  grid-template: "A B" auto / 1fr 1fr;
  grid-column-gap: 40px;
  margin-bottom: 40px;

  ${({ theme }) => theme.breakpoints.mobile} {
    display: flex;
    flex-direction: column;
  }
`
const Box = styled.div<{ area: string; isBreak: boolean }>`
  grid-column: ${({ area }) => area};
  position: relative;
  width: 100%;
  box-sizing: border-box;
  padding: 1em;
  margin-bottom: 0.5em;
  background-color: ${({ area, isBreak, theme }) =>
    isBreak
      ? theme.colors.disabled
      : area === "A"
      ? theme.colors.roomA
      : theme.colors.roomB};
  border-left: 5px solid;
  border-color: ${({ area, isBreak, theme }) =>
    isBreak
      ? theme.colors.disabledText
      : area === "A"
      ? theme.colors.roomABorder
      : theme.colors.roomBBorder};

  ::before {
    content: "";
    position: absolute;
    top: -8px;
    left: -10px;
    display: inline-block;
    width: 16px;
    height: 16px;
    border-radius: 100%;
    background-color: ${({ area, isBreak, theme }) =>
      isBreak
        ? theme.colors.disabledText
        : area === "A"
        ? theme.colors.roomABorder
        : theme.colors.roomBBorder};
  }
`
const Text = styled.span`
  display: block;
  font-size: 20px;
  font-family: ${({ theme }) => theme.fonts.text};
`

export default function SchedulePage() {
  const { t, i18n } = useTranslation()
  const { allSpeakersYaml, allTalksYaml } = useStaticQuery(graphql`
    query {
      allSpeakersYaml {
        edges {
          node {
            uuid
            name
          }
        }
      }
      allTalksYaml {
        edges {
          node {
            uuid
            title
            titleJa
            description
            descriptionJa
            spokenLanguage
            slideLanguage
            speakerIDs
            startsAt
            endsAt
            room
            date
          }
        }
      }
    }
  `)
  const speakers: SpeakerType[] = allSpeakersYaml.edges.map(
    ({ node }: any) => node,
  )
  const talks: TalkType[] = allTalksYaml.edges.map(({ node }: any) => node)
  const timetable = generateTimetable({ speakers, talks })
  const days = ["day1", "day2"] as const
  const enOrJa = (enStr: string, jaStr: string) => {
    return i18n.language === "en" ? enStr || jaStr : jaStr || enStr
  }

  return (
    <Layout>
      <SEO title={t("schedule")} description={t("schedule.description")} />{" "}
      <ResponsiveBox>
        <Breadcrumb path={[t("schedule")]} />
        <Title>{t("schedule")}</Title>
        <DaysButtonBox>
          <SmoothScroll selector="#day1">
            <LinkButton color="secondary" size="large" to="/schedule#day1">
              {t("day1")}
            </LinkButton>
          </SmoothScroll>
          <SmoothScroll selector="#day2">
            <LinkButton color="secondary" size="large" to="/schedule#day2">
              {t("day2")}
            </LinkButton>
          </SmoothScroll>
        </DaysButtonBox>

        {days.map(day => (
          <React.Fragment key={day}>
            <SubTitle id={day}>{t(day)}</SubTitle>
            {timetable[day].map(({ timebox, sessions }) => (
              <TimeBox key={timebox}>
                {sessions.map(s => (
                  <Box key={s.room + s.uuid} area={s.room} isBreak={s.break}>
                    <Text>
                      {s.startsAt}-{s.endsAt}
                    </Text>
                    <Text>{enOrJa(s.title, s.titleJa)}</Text>
                    {s.speakers.length ? (
                      <Text>
                        by{" "}
                        {s.speakers.map(speaker => speaker.name).join(" and ")}
                      </Text>
                    ) : null}
                  </Box>
                ))}
              </TimeBox>
            ))}
          </React.Fragment>
        ))}
      </ResponsiveBox>
    </Layout>
  )
}
