package com.stfciz.mmc.web;

import java.util.Arrays;

import org.springframework.boot.actuate.autoconfigure.AuditAutoConfiguration;
import org.springframework.boot.actuate.autoconfigure.CrshAutoConfiguration;
import org.springframework.boot.actuate.autoconfigure.EndpointMBeanExportAutoConfiguration;
import org.springframework.boot.actuate.autoconfigure.MetricFilterAutoConfiguration;
import org.springframework.boot.actuate.autoconfigure.MetricRepositoryAutoConfiguration;
import org.springframework.boot.actuate.autoconfigure.TraceRepositoryAutoConfiguration;
import org.springframework.boot.actuate.autoconfigure.TraceWebFilterAutoConfiguration;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.redis.RedisAutoConfiguration;
import org.springframework.boot.context.embedded.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.context.annotation.ImportResource;
import org.springframework.context.annotation.Profile;
import org.springframework.data.elasticsearch.repository.config.EnableElasticsearchRepositories;
import org.springframework.web.multipart.MultipartResolver;
import org.springframework.web.multipart.commons.CommonsMultipartResolver;

import com.stfciz.mmc.web.controller.CorsFilter;
import com.stfciz.mmc.web.oauth2.OAuth2Filter;
import com.stfciz.mmc.web.oauth2.PermissionAspect;

/**
 * 
 * @author stfciz
 *
 */
@Configuration
@ComponentScan(basePackages={"com.stfciz.mmc"})
@EnableElasticsearchRepositories(basePackages={"com.stfciz.mmc"})
@EnableAspectJAutoProxy(proxyTargetClass=true)
@ImportResource({"classpath:applicationContext-clt-core.xml"})
@EnableAutoConfiguration(exclude = { 
    AuditAutoConfiguration.class
  , RedisAutoConfiguration.class
  , CrshAutoConfiguration.class
  , MetricFilterAutoConfiguration.class
  , MetricRepositoryAutoConfiguration.class
  , TraceRepositoryAutoConfiguration.class
  , TraceWebFilterAutoConfiguration.class
  , EndpointMBeanExportAutoConfiguration.class // exports de endpoints
})
public class AppSpringWebConfiguration {
  
  private static final String [] FILTER_URL_PATTERNS = {"/*"};

  @Bean
  public MultipartResolver multipartResolver() {
    CommonsMultipartResolver multipartResolver = new CommonsMultipartResolver();
    multipartResolver.setMaxUploadSize(-1);
    return multipartResolver;
  }
 
  @Bean 
  public FilterRegistrationBean getCORSFilter(CorsFilter filter) {
    FilterRegistrationBean registrationBean = new FilterRegistrationBean(filter);
    registrationBean.setUrlPatterns(Arrays.asList(FILTER_URL_PATTERNS));
    registrationBean.setName(filter.getClass().getSimpleName());
    registrationBean.setOrder(1);
    return registrationBean;
  }
  
  @Bean 
  public FilterRegistrationBean getOAuth2Filter(OAuth2Filter filter) {
    FilterRegistrationBean registrationBean = new FilterRegistrationBean(filter);
    registrationBean.setUrlPatterns(Arrays.asList(FILTER_URL_PATTERNS));
    registrationBean.setName(filter.getClass().getSimpleName());
    registrationBean.setOrder(2);
    return registrationBean;
  }
  
  @Bean 
  @Profile("!test")
  public PermissionAspect permissionAspect() {
    return new PermissionAspect();
  }
}