package com.stfciz.mmc.web.api.music;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.ResourceBundle;

import org.springframework.http.HttpInputMessage;
import org.springframework.http.HttpOutputMessage;
import org.springframework.http.MediaType;
import org.springframework.http.converter.AbstractHttpMessageConverter;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.http.converter.HttpMessageNotWritableException;
import org.springframework.util.StreamUtils;

import com.itextpdf.text.BaseColor;
import com.itextpdf.text.Document;
import com.itextpdf.text.DocumentException;
import com.itextpdf.text.Element;
import com.itextpdf.text.Font;
import com.itextpdf.text.Image;
import com.itextpdf.text.Phrase;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;

/**
 * 
 * @author Bellevue
 *
 * @param <T>
 */
public class PdfHttpMessageFindResponseConverter extends
    AbstractHttpMessageConverter<FindResponse> {

  private static final String NO_VALUE = "";

  private static final int TITLE_FONT_SIZE = 12;

  private static final int HEADER_FONT_SIZE = 10;

  private static final int ITEM_FONT_SIZE = 8;
  
  private static final int NB_COLS = 7;

  private static final ResourceBundle RATING = ResourceBundle.getBundle("rating");

  /**
   * 
   */
  public PdfHttpMessageFindResponseConverter() {
    super(MediaType.valueOf("application/pdf"));
  }

  @Override
  protected boolean supports(Class<?> clazz) {
    return true;
  }

  @Override
  protected FindResponse readInternal(Class<? extends FindResponse> clazz,
      HttpInputMessage inputMessage) throws IOException,
      HttpMessageNotReadableException {
    return null;
  }

  @Override
  protected void writeInternal(FindResponse findResponse,
      HttpOutputMessage outputMessage) throws IOException,
      HttpMessageNotWritableException {
    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    OutputStream os = outputMessage.getBody();
    try {
      Image yesImg = Image
          .getInstance(this.getClass().getResource("/tick.png"));

      Document document = new Document();
      PdfWriter.getInstance(document, baos);
      document.open();

      PdfPTable table = new PdfPTable(new float[] { 3, 6, 2, 2, 2, 2, 2 });
      table.setWidthPercentage(100f);
      table.getDefaultCell().setUseAscender(true);
      table.getDefaultCell().setUseDescender(true);
      // Add the first header row
      Font titleFont = new Font();
      titleFont.setSize(TITLE_FONT_SIZE);
      titleFont.setColor(BaseColor.WHITE);
      PdfPCell cell = new PdfPCell(new Phrase(String.format("%s - %d item(s)",
          new SimpleDateFormat("yyyy/MM/dd").format(new Date()), findResponse
              .getDocs().size()), titleFont));
      cell.setBackgroundColor(BaseColor.BLACK);
      cell.setHorizontalAlignment(Element.ALIGN_CENTER);
      cell.setColspan(NB_COLS);
      table.addCell(cell);

      // Add the second header row twice
      Font headerFooterFont = new Font();
      titleFont.setSize(HEADER_FONT_SIZE);
      titleFont.setColor(BaseColor.BLACK);

      table.getDefaultCell().setBackgroundColor(BaseColor.LIGHT_GRAY);
      for (int i = 0; i < 1; i++) {
        addHeaderCell(table, headerFooterFont, "Artist");
        addHeaderCell(table, headerFooterFont, "Title");
        addHeaderCell(table, headerFooterFont, "Type");
        addHeaderCell(table, headerFooterFont, "Origin");
        addHeaderCell(table, headerFooterFont, "Year");
        //addHeaderCell(table, headerFooterFont, "Re-edition");
        addHeaderCell(table, headerFooterFont, "Sleeve");
        addHeaderCell(table, headerFooterFont, "Record");
      }
      table.getDefaultCell().setBackgroundColor(null);
      // There are three special rows
      table.setHeaderRows(2);
      // One of them is a footer
      //table.setFooterRows(1);
      // Now let's loop over the elements
      Font itemFont = new Font();
      titleFont.setSize(ITEM_FONT_SIZE);
      titleFont.setColor(BaseColor.BLACK);

      List<FindElementResponse> docs = findResponse.getDocs();
      for (FindElementResponse doc : docs) {
        addHeaderCell(table, itemFont, doc.getArtist());
        addHeaderCell(table, itemFont, doc.getTitle());
        table.addCell(String.format("%s %s", (doc.getNbType() != null && doc
            .getNbType() > 1) ? String.valueOf(doc.getNbType()) : NO_VALUE, doc
            .getMainType()));
        addHeaderCell(table, itemFont, doc.getOrigin());
        if (doc.getEdition() != null) {
          table.addCell(formatObjectValue(doc.getEdition() + " (new)"));
          //table.addCell(new PdfPCell(yesImg, false));
        } else {
          table.addCell(formatObjectValue(doc.getIssue()));
        }
        addHeaderCell(table, itemFont, formatRatingValue(doc.getSleeveGrade()));
        addHeaderCell(table, itemFont, formatRatingValue(doc.getRecordGrade()));
      }

      document.add(table);
      document.close();

      StreamUtils.copy(baos.toByteArray(), os);
    } catch (DocumentException e) {
      throw new HttpMessageNotWritableException("Write internal error", e);
    }
  }

  /**
   * 
   * @param table
   * @param font
   * @param value
   */
  private void addHeaderCell(PdfPTable table, Font font, Object value) {
    table.addCell(new PdfPCell(new Phrase(formatObjectValue(value), font)));
  }
  
  /**
   * 
   * @param value
   * @return
   */
  private String formatObjectValue(Object value) {
    return (value != null) ? String.valueOf(value) : NO_VALUE;
  }

  /**
   * 
   * @param value
   * @return
   */
  private String formatRatingValue(Integer value) {
    return (value != null) ? RATING.getString(String.valueOf(value)) : NO_VALUE;
  }
}
