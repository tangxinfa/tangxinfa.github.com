<?php
  /// please define LOGGING_APPNAME before include this file.
  /// e.g:
  ///    define('LOGGING_APPNAME', 'example_app');
  ///    require_once(dirname(__FILE__) . "/logging.inc");

if(file_exists(dirname(__FILE__) . '/libs/log4php/Logger.php')){
  require_once(dirname(__FILE__) . '/libs/log4php/Logger.php');
}else{
  require_once('log4php/Logger.php');
}

Logger::configure(array('rootLogger' => array('appenders' => array('default')),
                        'appenders' => array('default' => array('class' => 'LoggerAppenderRollingFile',
                                                                'layout' => array('class' => 'LoggerLayoutPattern',
                                                                                  'params' => array('conversionPattern' => '%date{Y-m-d H:i:s,u} [%level] %logger: %msg (%F:%L)%newline%ex')),
                                                                'params' => array('file' => dirname(__FILE__) . "/logs/" . LOGGING_APPNAME . ".log",
                                                                                  'append' => true,
                                                                                  'maxFileSize' => '10MB',
                                                                                  'maxBackupIndex' => 10)))));