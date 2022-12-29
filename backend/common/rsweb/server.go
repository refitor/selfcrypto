package rsweb

import (
	"context"
	"embed"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/didip/tollbooth"
	limiter2 "github.com/didip/tollbooth/limiter"
	"github.com/didip/tollbooth_negroni"
	"github.com/julienschmidt/httprouter"
	"github.com/phyber/negroni-gzip/gzip"
	"github.com/refitor/rslog"
	"github.com/rs/cors"
	"github.com/urfave/negroni"
)

type rsFS struct {
	fs      embed.FS
	webPath string
}

func (p rsFS) Open(name string) (http.File, error) {
	if name == "/" {
		return http.FS(p.fs).Open(p.webPath)
	}
	if _, err := p.fs.Open(p.webPath + "/" + strings.TrimPrefix(name, "/")); err == nil {
		return http.FS(p.fs).Open(p.webPath + "/" + strings.TrimPrefix(name, "/"))
	}
	return nil, errors.New("permission denied")
}

func Init(webPath string, fs embed.FS, routerFuncList ...func(*httprouter.Router)) *httprouter.Router {
	router := httprouter.New()

	if webPath != "" {
		router.NotFound = http.FileServer(&rsFS{fs, webPath})
	}

	for _, routerFunc := range routerFuncList {
		if routerFunc != nil {
			routerFunc(router)
		}
	}
	return router
}

func Run(ctx context.Context, port string, router *httprouter.Router, allowCredentials bool, allowOrigins ...string) {
	n := negroni.New()
	n.Use(newCors(allowCredentials, allowOrigins...))
	n.UseFunc(newGzip)
	n.Use(newRateLimite())
	n.UseFunc(newAPILog)
	n.UseHandlerFunc(router.ServeHTTP)
	server := &http.Server{Addr: fmt.Sprintf(":%v", port), Handler: n}

	rslog.Infof("run web server successed, listen: %v", port)
	go func() {
		if err := server.ListenAndServe(); err != nil {
			rslog.Errorf("run web server failed, detail: %s", err.Error())
		}
	}()
	<-ctx.Done()
	server.Shutdown(ctx)
}

func newAPILog(rw http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
	if !strings.HasPrefix(r.URL.Path, "/api") {
		next(rw, r)
		return
	}

	ts := time.Now()
	next(rw, r)
	rslog.Infof("%s %s, time: %v ms", r.Method, r.RequestURI, time.Since(ts).Milliseconds())
}

func newGzip(rw http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
	if strings.HasPrefix(r.URL.Path, "/api") {
		next(rw, r)
		return
	}
	gzip.Gzip(gzip.DefaultCompression).ServeHTTP(rw, r, next)
}

func newRateLimite() negroni.Handler {
	limiter := tollbooth.NewLimiter(1, &limiter2.ExpirableOptions{DefaultExpirationTTL: time.Hour, ExpireJobInterval: time.Second})
	limiter.SetIPLookups([]string{"RemoteAddr", "X-Forwarded-For", "X-Real-IP"}).SetMethods([]string{"GET", "POST"})
	limiter.SetMessage("You have reached maximum request limit.")
	return tollbooth_negroni.LimitHandler(limiter)
}

func newCors(allowCredentials bool, allowOrigins ...string) negroni.Handler {
	return cors.New(cors.Options{
		AllowedOrigins: allowOrigins,
		AllowCredentials: allowCredentials,
	})
}
