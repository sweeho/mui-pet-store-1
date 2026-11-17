import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";

/** The shared loading frame: skeleton rows while a page loads. */
export function LoadingFrame() {
  return (
    <Box data-testid="loading-frame" role="status" aria-label="Loading">
      {[0, 1, 2, 3, 4].map((row) => (
        <Box
          key={row}
          sx={{
            height: 40,
            display: "flex",
            alignItems: "center",
            gap: 2,
            px: 2,
            borderTop: row === 0 ? 0 : 1,
            borderColor: "divider",
          }}
        >
          <Skeleton width={120} height={12} />
          <Box sx={{ flex: 1 }} />
          <Skeleton width={64} height={12} />
        </Box>
      ))}
    </Box>
  );
}
