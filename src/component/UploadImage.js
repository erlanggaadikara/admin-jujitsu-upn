import { observer } from "mobx-react-lite";
import { toJS } from "mobx";
import { useRef, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardActionArea,
} from "@material-ui/core";
import UploadIcon from "@material-ui/icons/Upload";

export default observer(({ src, onChange }) => {
  const FileInput = useRef(null);
  return (
    <Card sx={{ width: 200 }} raised>
      <input
        type="file"
        ref={FileInput}
        style={{ display: "none" }}
        onChange={onChange}
      />
      <CardActionArea onClick={() => FileInput.current.click()}>
        {!src ? (
          <Box
            sx={{
              height: 200,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <UploadIcon fontSize="large" />
            <Typography variant="caption">
              Upload Image (".png, .jpg")
            </Typography>
          </Box>
        ) : (
          <CardMedia sx={{ height: 200 }} image={src.file ? src.file : src} />
        )}
      </CardActionArea>
    </Card>
  );
});
