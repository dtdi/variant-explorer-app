import { Blankslate } from "@primer/react/experimental";
import { BookIcon } from "@primer/octicons-react";
import { Link } from "react-router-dom";

export default function Blank() {
  return (
    <Blankslate narrow="true">
      <Blankslate.Visual>
        <BookIcon size="medium" />
      </Blankslate.Visual>
      <Blankslate.Heading>Welcome to Variant Explorer!</Blankslate.Heading>
      <Blankslate.Description>
        Wikis provide a place in your repository to lay out the roadmap of your
        project, show the current status, and document software better,
        together.
      </Blankslate.Description>
      <Blankslate.PrimaryAction href="/process/1">
        Process 1
      </Blankslate.PrimaryAction>
      <Blankslate.SecondaryAction href="/">
        Learn more about wikis
      </Blankslate.SecondaryAction>
    </Blankslate>
  );
}
