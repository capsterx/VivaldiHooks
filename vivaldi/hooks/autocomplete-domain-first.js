// domain first and allow search suggestions in address bar

var newUpdateAutocomplete = function(e) { 
  var A=null;
  var P=null;
  var K=null;

	return function(t) {
    if (A == null)
    {
      for (j in vivaldi.jdhooks._exports)
      {
        var t = vivaldi.jdhooks._exports[j]
				if (t && t["exports"])
        {
          var exports = t["exports"]
          if (exports["OMNI_RESULT_BOOKMARK_TITLE_EXACT"])
          {
            A = exports;
          }
          else if (exports["setUrlfieldState"])
          {
            P = exports;
          }
          else if (exports["parse"] && exports["Url"] && exports['format'])
          {
            K = exports;
          }
        }
      }
    }
		if (e.props.autocompletionEnabled && !e._isIMEOpen && (!Array.isArray(t) || 0 !== t.length)) {
			if (null == t || "undefined" == typeof t.url && (!Array.isArray(t.urls) || 0 === t.urls.length)) throw TypeError("updateAutocomplete needs an item with an url(s) property", t);
			var n = (e._typedUrl || "").length,
				i = t.url.indexOf("://") + 1;
			i > 0 && (i += 2);
			var a = "",
				r = 0;
			t.type === A.OMNI_RESULT_BOOKMARK_TITLE_EXACT ? a = e._typedUrl + t.title.substr(e._typedUrl.length) : (r = t.url.startsWith(e._typedUrl) ? 0 : t.url.substr(i).toLowerCase().indexOf(e._typedUrl.toLowerCase()) + i, a = t.url.substr(0, r) + e._typedUrl + t.url.substr(r + e._typedUrl.length));
			var o = e.refs.urlInput,
				s = o.value && o.selectionEnd === o.value.length;
			0 !== r && r !== i && (r !== i + 4 || "www." !== a.substr(i, 4)) || e._completed ? t.nickname && t.nickname === e._typedUrl && s && (P.setUrlfieldState(e.props.page.id, {
				editUrl: t.nickname,
				selectionStart: t.nickname.length,
				selectionEnd: t.nickname.length
			}), o.selectionDirection = "backward") : (e._completed = !0, s && ((function(url) {
				var parsed = K.parse(a.substr(r));
				var host = (parsed.protocol ? parsed.protocol + (parsed.slashes ? "//" : "") : "") + (parsed.hostname ? parsed.hostname : "") + (parsed.pathname ? parsed.pathname.replace(/^(.*?\/).*/, "$1") : "");
				if ((host.length > url.length) && !host.match('%')) a = a.substr(0, r) + host
			})(e._typedUrl), P.setUrlfieldState(e.props.page.id, {
				editUrl: a.substr(r),
				selectionStart: n,
				selectionEnd: a.length - r
			}), o.selectionDirection = "backward"))
		}
	}
}

var newGetCompleted = function(oldGetCompleted, self) {
  return function(e, t) {
		var newItem = e.concat(self._complist.map(function(x) {
			if (x.type == "OMNI_RESULT_SUGGEST")
			{
				return {
					id: x.id,
					type: "OMNI_RESULT_TYPED_HISTORY",
					url: x.url
				};
			}
			return undefined;
		}).filter(function(x) { return x; }));
		var x = oldGetCompleted.call(this, e, t);
    if (!x)
    {
      x = oldGetCompleted.call(this, newItem, t);
    }
    return x;
	}
}

var newSearchDone = function(oldSearchDone, e) {
	var doneSearch = false;
	return function() {
    if (!doneSearch) {
			for (j in vivaldi.jdhooks._exports)
			{
				var t = vivaldi.jdhooks._exports[j]
				if (t && t["exports"])
				{
          var exports = t["exports"]
					if (exports && exports['default'] && typeof(exports['default']) === 'function' && (('' + exports['default']).indexOf('getCompleted needs a list of items') > -1))
					{
						var oldGetCompleted = exports['default'];
						exports['default'] = newGetCompleted(oldGetCompleted, e);
					}
			  }
			}
			doneSearch = true;
		}
    return oldSearchDone.apply(this, arguments)
	}
}


/* This is the only way I could figure out how to hijack the right place */
var oldCall = Function.prototype.call
var newCall = function()
{
  var ret = oldCall.apply(this, arguments)
  Function.prototype.call = oldCall

  if (this.name == 'le' && arguments.length >=1 && arguments[0] && arguments[0].updateAutocomplete)
  {
    arguments[0].updateAutocomplete = newUpdateAutocomplete(arguments[0])
    var oldSearchDone = arguments[0].searchDone
    arguments[0].searchDone = newSearchDone(oldSearchDone, arguments[0])
  }
  else
  {
		Function.prototype.call = newCall
  }
  return ret;
}
Function.prototype.call = newCall
