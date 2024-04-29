import { Blankslate } from "@primer/react/experimental";
import { BookIcon } from "@primer/octicons-react";
import { useRouteError } from "react-router-dom";

export default function ErrorPage() {
  const error = useRouteError();
  console.error(error);
  return (
    <Blankslate narrow="true">
      <Blankslate.Visual>
        <BookIcon size="medium" />
      </Blankslate.Visual>
      <Blankslate.Heading>Ooops!</Blankslate.Heading>
      <Blankslate.Description>
        {error.statusText || error.message}
      </Blankslate.Description>
      <Blankslate.PrimaryAction href="#">
        Create the first page
      </Blankslate.PrimaryAction>
      <Blankslate.SecondaryAction href="#">
        Learn more about wikis
      </Blankslate.SecondaryAction>
    </Blankslate>
  );
}
