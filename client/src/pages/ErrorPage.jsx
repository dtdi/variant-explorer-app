import { Blankslate } from "@primer/react/experimental";
import { BookIcon } from "@primer/octicons-react";
import { useRouteError } from "react-router-dom";
import { BaseStyles, Box, Text, ThemeProvider } from "@primer/react";

export default function ErrorPage() {
  const error = useRouteError();
  console.error(error);
  return (
    <ThemeProvider>
      <BaseStyles>
        <Box
          sx={{
            display: "grid",
            gridTemplateRows: "auto 1fr auto",
            height: "100vh",
          }}
        >
          <Blankslate narrow="true">
            <Blankslate.Visual>
              <BookIcon size="medium" />
            </Blankslate.Visual>
            <Blankslate.Heading>Ooops!</Blankslate.Heading>
            <Blankslate.Description>
              {error.statusText || error.message}
            </Blankslate.Description>
            <Blankslate.PrimaryAction href="/">Reload</Blankslate.PrimaryAction>
          </Blankslate>
        </Box>
      </BaseStyles>
    </ThemeProvider>
  );
}
