package com.stfciz.mmc.web.api;

/**
 * 
 * @author Bellevue
 *
 */
public class UpdatePrice {
  
  private Integer price;
  
  private Integer month;
  
  private Integer year;

  /**
   * 
   */
  public UpdatePrice() {
    
  }

  /**
   * 
   * @param price
   * @param year
   * @param month
   */
  public UpdatePrice(Integer price, Integer year, Integer month) {
   this.price = price;
   this.year = year;
   this.month = month;
  }
  
  public Integer getPrice() {
    return price;
  }
  public void setPrice(Integer price) {
    this.price = price;
  }
  public Integer getMonth() {
    return month;
  }
  public void setMonth(Integer month) {
    this.month = month;
  }
  public Integer getYear() {
    return year;
  }
  public void setYear(Integer year) {
    this.year = year;
  }
}
