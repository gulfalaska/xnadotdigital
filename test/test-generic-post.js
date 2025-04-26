const assert = require("assert").strict;
const expect = require("expect.js");
const { JSDOM } = require("jsdom");
const readFileSync = require("fs").readFileSync;
const existsSync = require("fs").existsSync;
const metadata = require("../_data/metadata.json");

/**
 * These tests kind of suck and they are kind of useful.
 *
 * They suck, because they need to be changed when the hardcoded post changes.
 * They are useful because I tend to break the things they test al the time.
 */

describe("check build output for a generic post", () => {
  describe("sample post", () => {
    const POST_FILENAME = "_site/posts/firstpost/index.html";
    const URL = metadata.url;
    const POST_URL = URL + "/posts/firstpost/";

    if (!existsSync(POST_FILENAME)) {
      it("WARNING skipping tests because POST_FILENAME does not exist", () => {});
      return;
    }

    let dom;
    let html;
    let doc;

    function select(selector, opt_attribute) {
      const element = doc.querySelector(selector);
      assert(element, "Expected to find: " + selector);
      if (opt_attribute) {
        return element.getAttribute(opt_attribute);
      }
      return element.textContent;
    }

    before(() => {
      html = readFileSync(POST_FILENAME);
      dom = new JSDOM(html);
      doc = dom.window.document;
    });

    it("should have metadata", () => {
      assert.equal(select("title"), "This is my first post.");
      expect(select("meta[property='og:image']", "content")).to.match(
        /\/img\/remote\/\w+.jpg/
      );
      assert.equal(select("link[rel='canonical']", "href"), POST_URL);
      assert.equal(
        select("meta[name='description']", "content"),
        "This is a post on My Blog about agile frameworks."
      );
    });



    it("should have a good CSP", () => {
      const csp = select(
        "meta[http-equiv='Content-Security-Policy']",
        "content"
      );
      expect(csp).to.contain(";object-src 'none';");
      expect(csp).to.match(/^default-src 'self';/);
    });

    it("should have accessible buttons", () => {
      const buttons = doc.querySelectorAll("button");
      for (let b of buttons) {
        expect(
          (b.firstElementChild === null && b.textContent.trim()) ||
            b.getAttribute("aria-label") != null
        ).to.be.true;
      }
    });


    it("should have a published date", () => {
      expect(select("article time")).to.equal("01 May 2018");
      expect(select("article time", "datetime")).to.equal("2018-05-01");
    });



    describe("body", () => {



    });
  });
});
