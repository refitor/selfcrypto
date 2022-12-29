package rsweb

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"strconv"
	"strings"

	"github.com/refitor/rslog"
)

const (
	C_Data_Pass           = "pass"
	C_Data_Pending        = "pending"
	C_Data_Success        = "successed"
	C_Error_Denied        = "permission denied"
	C_Error_InvalidParams = "invalid request params"
)

var EnableLog = true

// ====================================== http =========================================
type WebResponse struct {
	Data     interface{}
	Redirect string
	Error    string
}

// http.Request
func HttpGetByFunc(url string, fHandle func(buf []byte)) error {
	resp, err := http.Get(url)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	raw, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return err
	}
	if fHandle != nil {
		fHandle(raw)
	}
	return nil
}

func HttpPostByFunc(url string, form url.Values, fHandle func(buf []byte)) error {
	resp, err := http.PostForm(url, form)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	raw, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return err
	}
	if fHandle != nil {
		fHandle(raw)
	}
	return nil
}

// http.Response
func ResponseDirect(w http.ResponseWriter, r *http.Request, data []byte, strType string) {
	w.Header().Set("Content-Length", strconv.Itoa(len(data)))
	w.Header().Set("Content-Type", strType)
	w.WriteHeader(http.StatusOK)
	w.Write(data)
	rslog.Debugf("%s %s: %v", r.Method, r.URL.Path, string(data))
}

func ResponseError(w http.ResponseWriter, r *http.Request, errorInfo string) {
	ret := struct {
		Error string
	}{}
	ret.Error = errorInfo
	respBuf, err := json.Marshal(ret)
	if err != nil {
		ret.Error = fmt.Errorf("%s %s: %v", r.Method, r.URL.Path, err.Error()).Error()
	}
	w.Header().Set("Content-Length", strconv.Itoa(len(respBuf)))
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(respBuf)
	rslog.Errorf("%s %s: %v", r.Method, r.URL.Path, ret.Error)
}

func ResponseOk(w http.ResponseWriter, r *http.Request, data interface{}) {
	doResponseOk(w, r, &WebResponse{Data: data})
}

func ResponseRedirect(w http.ResponseWriter, r *http.Request, url string) {
	doResponseOk(w, r, &WebResponse{Redirect: url})
}

func ResponseToken(w http.ResponseWriter, r *http.Request, data interface{}, token string) {
	ret := &struct {
		Data  interface{}
		Token string
		Error string
	}{
		Data:  data,
		Token: token,
	}
	doResponseOk(w, r, ret)
}

func doResponseOk(w http.ResponseWriter, r *http.Request, data interface{}) {
	respBuf, err := json.Marshal(data)
	if err != nil {
		rslog.Errorf("%s %s: %v", r.Method, r.URL.Path, err.Error())
		ResponseError(w, r, err.Error())
		return
	}

	w.Header().Set("Content-Length", strconv.Itoa(len(respBuf)))
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(respBuf)
	rslog.Debugf("%s %s: %v", r.Method, r.URL.Path, string(respBuf))
}

func ResponseOkIndent(w http.ResponseWriter, r *http.Request, data interface{}, prefix, indent string) {
	respBuf, err := json.MarshalIndent(data, prefix, indent)
	if err != nil {
		jsonErr := fmt.Errorf("ResponseOk failed while doing json.MarshalIndent, detail: %v", err.Error())
		rslog.Errorf("%s %s: %v", r.Method, r.URL.Path, jsonErr.Error())
		http.Error(w, jsonErr.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Length", strconv.Itoa(len(respBuf)))
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(respBuf)
	rslog.Debugf("%s %s: %v", r.Method, r.URL.Path, string(respBuf))
}

// http.Tools
const c_params_parsed = "parsed"
const c_params_decrypted = "decrypted"

func WebParams(r *http.Request) url.Values {
	ret := make(url.Values, 0)
	if r.Header.Get(c_params_parsed) != "true" {
		if strings.Contains(r.Header.Get("Content-Type"), "multipart/form-data") {
			if err := r.ParseMultipartForm(32 << 20); err != nil {
				rslog.Errorf("%s %s.ParseMultipartForm: %v", r.Method, r.URL.Path, err.Error())
				return ret
			}
		} else {
			if err := r.ParseForm(); err != nil {
				rslog.Errorf("%s %s.ParseForm: %v", r.Method, r.URL.Path, err.Error())
				return ret
			}
		}
	}

	for k := range r.URL.Query() {
		ret.Add(k, r.URL.Query().Get(k))
	}
	for k := range r.Header {
		ret.Add(k, r.Header.Get(k))
	}
	for k := range r.Form {
		if ret.Get(k) == "" {
			ret.Add(k, r.Form.Get(k))
		}
	}
	for k := range r.PostForm {
		if ret.Get(k) == "" {
			ret.Add(k, r.PostForm.Get(k))
		}
	}
	r.Header.Add(c_params_parsed, "true")
	return ret
}

func WebDecryptParams(r *http.Request, decryptFunc func(s string, v *url.Values)) url.Values {
	ret := WebParams(r)
	if r.Header.Get(c_params_decrypted) != "true" {
		for k, _ := range ret {
			if k != "encryptedParams" {
				continue
			}
			if decryptFunc != nil {
				decryptFunc(ret.Get(k), &ret)
			}
			r.Header.Add(c_params_decrypted, "true")
		}
	}
	return ret
}
