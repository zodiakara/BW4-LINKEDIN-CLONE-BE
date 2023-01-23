import PdfPrinter from "pdfmake";
import imageToBase64 from "image-to-base64";
import { pipeline } from "stream";

const createCVPdf = async (id, user, res) => {
  // Function converts image URL (not usable by pdfmake) to base64 Image data URI (usable by pdfmake)

  const convertToURI = async (image) => {
    const imageBase64 = await imageToBase64(image);
    const imageURI = "data:image/jpeg;base64," + imageBase64;
    return imageURI;
  };

  //   Converts singular profile picture
  const profilePic = await convertToURI(user.image);

  try {
    // Completes an array of image converting promises for the experience images
    await Promise.all(
      user.experiences.map((experience) => convertToURI(experience.image))
    ).then(async (values) => {
      const ImageObject = new Object();

      //   Saves each promise as numbered properties for use within Pdfmake's image processor
      for (let i = 0; i < values.length; i++) {
        ImageObject["expImg" + i.toString()] = values[i];
      }

      const fonts = {
        Roboto: {
          normal: "Helvetica",
          bold: "Helvetica-Bold",
          italics: "Helvetica-Oblique",
          bolditalics: "Helvetica-BoldOblique",
        },
      };

      const printer = new PdfPrinter(fonts);

      const experiencesPDFArray = [];

      //   Iteratively adds experiences image reference and text objects to array
      for (let i = 0; i < user.experiences.length; i++) {
        experiencesPDFArray.push({
          columns: [
            {
              image: "expImg" + i.toString(),
              width: 100,
              alignment: "left",
            },
            {
              text:
                "\n\n" +
                user.experiences[i].role +
                "\n\n" +
                user.experiences[i].company +
                "\n\n",
              style: "subheader",
              alignment: "center",
            },
          ],
        });
      }

      //   Combines User data with Experiences data

      const content = [
        {
          alignment: "justify",
          columns: [
            {
              image: "profilePicture",
              width: 200,
              alignment: "center",
            },
            {
              text: "\n\n\n\n\n" + user.name + " " + user.surname + "\n\n",
              style: "header",
              alignment: "center",
            },
          ],
        },
        {
          text: "\n\n" + user.title + "\n\n",
          style: "subheader",
          alignment: "center",
        },
        {
          text: "\n" + user.area + "\n\n\n\n",
          style: "subheader",
          alignment: "center",
        },
        {
          text: user.email,
          alignment: "left",
        },
        {
          text: "\n Bio: " + user.bio + "\n\n",
          alignment: "justify",
        },
        {
          text: "\n" + "Experiences:" + "\n\n",
        },
        ...experiencesPDFArray,
      ];

      const styles = {
        header: {
          fontSize: 18,
          bold: true,
        },
        subheader: {
          fontSize: 15,
          bold: true,
        },
        quote: {
          italics: true,
        },
        small: {
          fontSize: 8,
        },
        defaultStyle: {
          font: "Helvetica",
        },
      };

      // Collates all text, image, and styles data into final object

      const docDefinition = {
        content: content,
        styles: styles,
        images: {
          profilePicture: profilePic,
          ...ImageObject,
        },
      };

      // Creates and ends readable stream

      const pdfReadableStream = await printer.createPdfKitDocument(
        docDefinition
      );

      await pdfReadableStream.end();

      // Streams PDF to user

      const source = pdfReadableStream;
      const destination = res;

      pipeline(source, destination, (error) => {
        if (error) console.log(error);
      });
    });
  } catch (error) {
    console.log(error);
  }
};

export default createCVPdf;