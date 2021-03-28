const ytdl = require("ytdl-core");

const https = require("https");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const path = require("path");

const got = require("got");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  cors({
    exposedHeaders: ["Content-Disposition"],
  })
);
app.use(express.static(path.join(__dirname, "/public")));

app.post("/yt", async (req, res) => {
  try {
    // const { formats } = await ytdl.getInfo(req.body.url);
    const { videoDetails } = await ytdl.getInfo(req.body.url);
    const q = req.body.quality;
    let itag  = q === 'sd' ? '18' : q === 'hd' ? '22' : '18';

    // check the audio only option
    const audioFlag = req.body.audio === 'audioonly' ? true : false;
    if(audioFlag) {
      itag = '140';
    }

    res.header("Content-Disposition", `attachment; filename=${videoDetails.title}.${audioFlag ? 'mp3' : 'mp4'}`);
    // ytdl(req.body.url, {filter: 'videoonly'},{quality: 'highestvideo'}).pipe(res);
    return ytdl(req.body.url, {quality: itag}).pipe(res);

  } catch (err) {
    console.log(err);
    return res.send(error);
  }
});

app.post("/fb", async (req, res) => {
  try {
    got(req.body.url).then((response) => {

      const sdLink = response.body.split('sd_src:"')[1].split('",hd_tag')[0];
      const hdLink = response.body.split('hd_src:"')[1] ? response.body.split('hd_src:"')[1].split('",sd_src:"')[0] : sdLink;

      const linkToRedirect = req.body.quality === 'hd' ? hdLink : sdLink;

      return res.redirect(linkToRedirect);

      // const file = fs.createWriteStream(`video.mp4`);
      // const request = https.get(link, response => {
      //   response.pipe(file);
      //   console.log(`Finished downloading video`);
      //   return res.send('Finished downloading video')
      // });
      // return res.redirect(link);
    });
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
});

app.post("/insta", async (req, res) => {
  try {
    got(req.body.url).then((response) => {
      console.log('response',response);
      const link = response.body.split('<meta property="og:video" content="')[1];
      console.log('link', link);
      return;
      // const link = response.body.split('<meta property="og:video" content="')[1].split('" />')[0];
      // if(!link) {
      //   return res.send('invalid link!')
      // }
      // return res.redirect(link);
    });
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
});

// app.post("/rd", async (req, res) => {
//   try {
//     got('https://vred.rip/api/vreddit/c3yz1mambar51').then((response) => {
//       return res.send(response.body);
//     });


//   } catch (error) {
//     console.log(error);
//   }
// });

// app.post("/tw", async (req, res) => {
//   try {
//     got(req.body.url).then((response) => {
//       // console.log(response.body.split('hd_tag:"')[1]);
//       // const link = response.body.split('sd_src:"')[1].split('",hd_tag')[0];
//     });
//   } catch (error) {
//     console.log(error);
//   }
// });

const port = process.env.PORT || 3002;

app.listen(port, () => {
  console.log(`server is up on port ${port}`);
});
