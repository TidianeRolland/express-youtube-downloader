import express, { Express, Request, Response } from "express";
import ytdl from "ytdl-core";
import cors from "cors";
import contentDisposition from "content-disposition";

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

interface VideoInfo {
  title: string;
  thumbnail_url: unknown;
  author: string;
  lengthSeconds: string;
}

app.post("/videoInfo", async (req: Request, res: Response) => {
  const url = req.body.url;

  await ytdl
    .getInfo(url)
    .then((info) => {
      const videoInfo: VideoInfo = {
        title: info.player_response.videoDetails.title,
        author: info.player_response.videoDetails.author,
        thumbnail_url: info.videoDetails.thumbnails[0].url,
        lengthSeconds: info.videoDetails.lengthSeconds,
      };
      return res.status(200).send({ success: true, videoInfo });
    })
    .catch(() => {
      return res.status(400).send({ success: false }).json();
    });
});

app.get("/download", async (req: Request, res: Response) => {
  const { url, filter, quality, title } = req.query;
  const extension = filter === "audio" ? "mp3" : "mp4";
  const filename = `${title}.${extension}`;

  res.setHeader(
    "Content-Disposition",
    `attachment; filename=${contentDisposition(filename)}`
  );

  const _filter = filter === "audio" ? "audioonly" : "audioandvideo";
  let _quality = "";
  if (filter === "audio") {
    _quality = quality === "high" ? "highestaudio" : "lowestaudio";
  } else {
    _quality = quality === "high" ? "highestvideo" : "lowestvideo";
  }

  ytdl(url as string, {
    filter: _filter,
    quality: _quality,
  }).pipe(res);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});
