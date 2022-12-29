package rsauth

import (
	"crypto/tls"
	"fmt"
	"net/smtp"
	"regexp"
	"strconv"
	"strings"

	"gopkg.in/gomail.v2"
)

// email push
var (
	v_email_from   = ""
	v_email_host   = ""
	v_email_passwd = ""
)

func InitEmail(host, from, pwd string) {
	v_email_from = from
	v_email_host = host
	v_email_passwd = pwd
}

func isValidEmail(email string) bool {
	isValid, _ := regexp.MatchString("^([a-z0-9_\\.-]+)@([\\da-z\\.-]+)\\.([a-z\\.]{2,6})$", email)
	return isValid
}

func PushByEmail(pushMail, pushTitle, pushDesc, content string, fCallBack func(error)) (string, error) {
	if !isValidEmail(pushMail) {
		return "", fmt.Errorf("invalid email format, please input again, email: %v, content: %s", pushMail, content)
	}

	pushContent := content
	if pushDesc != "" {
		pushContent = fmt.Sprintf("%v\n%v", pushDesc, content)
	}
	go func() {
		err := sendEmailTLS("", pushMail, pushTitle, pushContent)
		if fCallBack != nil {
			fCallBack(err)
		}
	}()
	return pushContent, nil
}

func sendEmailTLS(from, to, subject, msg string) error {
	if from == "" {
		from = v_email_from
	}
	m := gomail.NewMessage()
	m.SetHeader("From", from)
	m.SetHeader("To", to)
	m.SetHeader("Subject", subject)
	m.SetBody("text/plain", msg)

	port, _ := strconv.Atoi(strings.Split(v_email_host, ":")[1])
	d := &gomail.Dialer{
		Port:      port,
		SSL:       true,
		Username:  v_email_from,
		Password:  v_email_passwd,
		Host:      strings.Split(v_email_host, ":")[0],
		TLSConfig: &tls.Config{InsecureSkipVerify: true},
		Auth:      smtp.PlainAuth(v_email_passwd, v_email_from, v_email_passwd, strings.Split(v_email_host, ":")[0]),
	}
	return d.DialAndSend(m)
}
