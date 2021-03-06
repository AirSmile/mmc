package com.stfciz.mmc.core;

import javax.validation.constraints.NotNull;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import com.stfciz.mmc.core.photo.flickr.FlickrConfiguration;

@Component
@ConfigurationProperties(prefix = "core")
public class CoreConfiguration {

  @NotNull
  private FlickrConfiguration flickr;

  /**
   * @return the flickr
   */
  public FlickrConfiguration getFlickr() {
    return this.flickr;
  }

  /**
   * @param flickr
   *          the flickr to set
   */
  public void setFlickr(FlickrConfiguration flickr) {
    this.flickr = flickr;
  }
}
