import { Box, Heading, Text } from "@primer/react";

export default function Base({ aggregate }) {
  if (!aggregate) {
    return null;
  }
  return (
    <Box sx={{ bg: "canvas.inset", p: 3, borderRadius: 2 }}>
      <Heading as="h4" sx={{ fontSize: 1 }}>
        KPI Box
      </Heading>
      <Text sx={{ fontSize: 2 }}>{aggregate.data.rows}</Text>
    </Box>
  );
}
