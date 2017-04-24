window.jQuery = window.$ = require("./jquery");
/**
 * created by chenlei 2016/11/11
 */
var ev_resize = document.createEvent("CustomEvent");
ev_resize.initCustomEvent("resize", false, false, null);

function init() {
    if (typeof jQuery === 'undefined') {
        alert("jQuery runtime needed.");
        return;
    }

    var splitterbarWH = 5;
    // CreateDomElement
    function createDockContainer(dockType) {
        if (dockType === "vbox")
            return $("<div class='dock-container vertical'></div>");
        if (dockType === "hbox")
            return $("<div class='dock-container horizental'></div>");
    }

    function createSplitBar(splitterType) {
        if (splitterType === "v")
            return $('<div class="splitter-bar vertical"></div>');
        if (splitterType === "h")
            return $('<div class="splitter-bar horizental"></div>');
    }

    function createTabPanel() {
        return $('<div class="tab-panel">\
                    <div class="tab-pages">\
                    </div>\
                    <div class="panel-header-list">\
                    </div>\
                </div>');
    }

    function addTabPage($tabpanel_, page_id_, page_title_) {
        if (!$tabpanel_.is('.tab-panel'))
            return;
        var page_ = $('<div id="' + page_id_ + '" class="tab-page active" draggable="true">\
                            <div class="page-title">' + page_title_ + '</div>\
                            <div class="page-body"></div>\
                        </div>');
        $tabpanel_.find(".tab-pages").prepend(page_);
        var header_ = $('<div data-target="' + page_id_ + '" class="tab active">' + page_id_ + '</div>')
        $tabpanel_.find(".panel-header-list").prepend(header_);
    }

    function moveTabPage(srcPage, dstContainer) {
        var originContainer = srcPage.closest(".dock-container");
        //if (originContainer === dstContainer)
        //  return;

        // console.log(originContainer, dstContainer);

        var siblingsLen = srcPage.siblings().length;
        if (srcPage.next().length > 0)
            srcPage.next().addClass("active");
        else
            srcPage.parent().children().first().addClass("active");

        var $srcheader = srcPage.parent().next(".panel-header-list").children("[data-target='" + srcPage.attr("id") + "']");
        if ($srcheader.next().length > 0)
            $srcheader.next().addClass("active");
        else
            $srcheader.parent().children().first().addClass("active");


        // move to new parent.
        dstContainer.find(".tab-pages").prepend(srcPage);
        srcPage.siblings().removeClass("active");

        dstContainer.find(".panel-header-list").prepend($srcheader);
        $srcheader.siblings().removeClass("active");

        if (siblingsLen === 0) { //only a page, remove 
            // remove splitter
            if (originContainer.prev().length > 0) {
                originContainer.prev().remove(); //remove bar
                if (originContainer.siblings().length == 1) { // if only a sibling
                    // console.log("clear unnecessary container");
                    originContainer.parent().append(originContainer.prev().children());
                    originContainer.prev().remove();
                } else {
                    if (originContainer.is(".vertical"))
                        originContainer.prev().outerWidth(originContainer.prev().outerWidth() +
                            originContainer.outerWidth() + splitterbarWH);
                    else
                        originContainer.prev().outerHeight(originContainer.prev().outerHeight() +
                            originContainer.outerHeight() + splitterbarWH);
                }
            } else if (originContainer.next().length > 0) {
                originContainer.next().remove();
                if (originContainer.siblings().length == 1) {
                    // console.log("clear unnecessary container");
                    originContainer.parent().append(originContainer.next().children());
                    originContainer.next().remove();
                } else {
                    if (originContainer.is(".vertical"))
                        originContainer.next().outerWidth(originContainer.next().outerWidth() +
                            originContainer.outerWidth() + splitterbarWH);
                    else
                        originContainer.next().outerHeight(originContainer.next().outerHeight() +
                            originContainer.outerHeight() + splitterbarWH);
                }
            } else {
                // console.warn("originContainer is the only child of its parent");
            }

            originContainer.remove();
        }
    }

    //$(document).ready(function(){
    // splitter-bar
    function move(e) {
        var $currentSplitter = e.data.src;
        var gap;
        if ($currentSplitter.is(".vertical")) {
            gap = e.pageX - $currentSplitter.offset().left;
            $currentSplitter.prev().outerWidth($currentSplitter.prev().outerWidth() + gap);
            reallocChildSize($currentSplitter.prev(), ".dock-container.horizental");
            $currentSplitter.next().outerWidth($currentSplitter.next().outerWidth() - gap);
            reallocChildSize($currentSplitter.next(), ".dock-container.horizental");

        } else {
            gap = e.pageY - $currentSplitter.offset().top;
            $currentSplitter.prev().outerHeight($currentSplitter.prev().outerHeight() + gap);
            reallocChildSize($currentSplitter.prev(), ".dock-container.vertical");
            $currentSplitter.next().outerHeight($currentSplitter.next().outerHeight() - gap);
            reallocChildSize($currentSplitter.next(), ".dock-container.vertical");
        }
        // dispatch resize event
        $currentSplitter.prev().find("dock-table2").each((index,item)=>{
            item.dispatchEvent(ev_resize);
        });
        $currentSplitter.next().find("dock-table2").each(item=>{
            item.dispatchEvent(ev_resize);
        });
        gap = null;
        $currentSplitter = null;
    }
    function initSplitBar() {
        $(".splitter-bar").off("mousedown");
        $(".splitter-bar").on("mousedown", function (e) {
            var $splitter = $(this);
            // console.log("mousedown", $splitter);
            $(document.body).on("mousemove", { src: $(this) }, move);
            //$(document.body).off("mouseup");
            $(document.body).one("mouseup", function (e) {
                // console.log("mouseup", $(this));
                $(this).off("mousemove");
            })
        })
    }
    initSplitBar();
    // smart resize
    function reallocChildSize($parent, childSelector) {
        var childrens = $parent.children(childSelector);
        if (childrens.length == 0) {
            return;
        }
        var atrrName = childSelector.indexOf(".vertical") > 0 ? "outerWidth" : "outerHeight";
        var childrenTotalWH = 0;
        childrens.each(function () {
            childrenTotalWH += $(this)[atrrName]();
        });

        var parentWH = $parent[atrrName]();
        //console.log(parentWH, childrenTotalWH);
        var diff = parentWH - childrenTotalWH - (childrens.length - 1) * splitterbarWH;
        var zoomRate = parentWH / (parentWH - diff); //container zoom rate.
        childrens.each(function (i) {
            if (i === childrens.length - 1) { //last child
                $(this)[atrrName]($(this)[atrrName]() + diff);
            } else {
                diff -= parseInt($(this)[atrrName]() * (zoomRate - 1));
                $(this)[atrrName](parseInt($(this)[atrrName]() * zoomRate));
            }

            if (atrrName === "outerWidth")
                reallocChildSize($(this), ".dock-container.horizental");
            else
                reallocChildSize($(this), ".dock-container.vertical");
        });

        zoomRate = null;
        diff = null;
        parentWH = null;
        childrens = null;
        childrenTotalWH = null;
    };

    $(window).resize(function () {
        reallocChildSize($("#root"), ".dock-container.horizental");
    });

    // drag and drop panel
    function initDragAndDrop() {
        $(".page-title").off(); //remove all listener
        $(".dock-sn, .dock-ew, .dock-cover").css("display", "none");
        $(".page-title").attr("draggable", "true");
        $(".page-title").on("dragstart", function (e) {
            // console.log(e.target.parentNode.id, " tabpage drag start");
            $(document).data("drag-src-id", e.target.parentNode.id);
        });
        $(".page-title").on("dragend", function (e) {
            $(".dock-sn, .dock-ew, .dock-cover").css("display", "none");
            //$(".dock-center, .dock-west, .dock-east, .dock-north, .dock-south").off("dragover");
            //$(".dock-center, .dock-west, .dock-east, .dock-north, .dock-south").off("drop");
            $(document).removeData("drag-src-id")
        });
    }
    initDragAndDrop();

    $(".dock-center,.dock-west,.dock-east,.dock-south,.dock-north").on("dragover", function (e) {
        e.preventDefault();
        //console.log($(document).data("drag-src-id"), );
        var parentRect = $(document).data("drop-dock-bound");
        if ($(this).is(".dock-center")) {
            $(".dock-cover").css({
                display: "block",
                left: parentRect.left,
                top: parentRect.top,
                width: parentRect.width,
                height: parentRect.height
            });
        } else if ($(this).is(".dock-west")) {
            $(".dock-cover").css({
                display: "block",
                left: parentRect.left,
                top: parentRect.top,
                width: parentRect.width / 3,
                height: parentRect.height
            });
        } else if ($(this).is(".dock-east")) {
            $(".dock-cover").css({
                display: "block",
                left: parentRect.left + parentRect.width - parentRect.width / 3,
                top: parentRect.top,
                width: parentRect.width / 3,
                height: parentRect.height
            });
        } else if ($(this).is(".dock-north")) {
            $(".dock-cover").css({
                display: "block",
                left: parentRect.left,
                top: parentRect.top,
                width: parentRect.width,
                height: parentRect.height / 3
            });
        } else if ($(this).is(".dock-south")) {
            $(".dock-cover").css({
                display: "block",
                left: parentRect.left,
                top: parentRect.top + parentRect.height - parentRect.height / 3,
                width: parentRect.width,
                height: parentRect.height / 3
            });
        }
    });

    $(".dock-center, .dock-west, .dock-east, .dock-north, .dock-south").on("drop", function (e) {
        e.preventDefault();
        var id = $(document).data("drag-src-id");
        var $parent = $(document).data("drop-dock-ref");
        var $src = $("#" + id);

        if ($(this).is(".dock-center")) {
            if ($parent.find("#" + id).length > 0) {
                // console.log("#", id, $parent.find("#" + id).length);
                return;
            }
            // console.log("direct put into $parent");
            moveTabPage($src, $parent);
        } else if ($(this).is(".dock-west,.dock-east")) {
            if ($parent.is(".vertical")) {
                // console.log("to create a brother on $parent's left or right");
                $newEle = createDockContainer("vbox"); // to put page into it.
                $newEle.outerWidth($parent.outerWidth() / 2 - splitterbarWH);
                $parent.outerWidth($parent.outerWidth() - $parent.outerWidth() / 2);
                if ($(this).is(".dock-west")) {
                    $parent.before($newEle);
                    $parent.before(createSplitBar("v"));
                } else {
                    $parent.after($newEle);
                    $parent.after(createSplitBar("v"));
                }
                // calc size
                reallocChildSize($parent, ".dock-container.horizental");
            } else { // horizental
                if ($parent.children(".vertical").length > 0) { //big container
                    // console.log("dragsrc to be most left or right child of $parent");
                    $newEle = createDockContainer("vbox");
                    var closestChild;
                    if ($(this).is(".dock-west")) {
                        closestChild = $parent.children().first();
                        $parent.prepend(createSplitBar("v"));
                        $parent.prepend($newEle);
                    } else {
                        closestChild = $parent.children().last();
                        $parent.append(createSplitBar("v"));
                        $parent.append($newEle);
                    }
                    $newEle.outerWidth(closestChild.outerWidth() / 2 - splitterbarWH);
                    // calc size
                    closestChild.outerWidth(closestChild.outerWidth() - closestChild.outerWidth() / 2);
                    reallocChildSize($parent, ".dock-container.vertical");
                } else { //small container
                    // console.log("create a horizental container, put dragsrc and parent into it, dragsrc on left or right");
                    var $oldEle = createDockContainer("vbox");
                    $oldEle.append($parent.children());
                    $oldEle.outerWidth($parent.outerWidth() - $parent.outerWidth() / 2);
                    var $newEle = createDockContainer("vbox");
                    $newEle.outerWidth($parent.outerWidth() / 2 - splitterbarWH);

                    if ($(this).is(".dock-west")) {
                        $parent.append($newEle).append(createSplitBar("v")).append($oldEle);
                    } else {
                        $parent.prepend($newEle).prepend(createSplitBar("v")).prepend($oldEle);
                    }
                    reallocChildSize($parent, ".dock-container.vertical");
                }
            }
            $newEle.append(createTabPanel());
            moveTabPage($src, $newEle);
        } else if ($(this).is(".dock-north, .dock-south")) {
            if ($parent.is(".horizental")) {
                //console.log("to create a brother on $parent's top or bottom");
                var $newEle = createDockContainer("hbox");
                $newEle.outerHeight($parent.outerHeight() / 2 - splitterbarWH);
                $newEle.outerWidth($parent.outerWidth());
                $parent.outerHeight($parent.outerHeight() - $parent.outerHeight() / 2);

                if ($(this).is(".dock-north")) {
                    $parent.before($newEle);
                    $parent.before(createSplitBar("h"));
                } else {
                    $parent.after($newEle);
                    $parent.after(createSplitBar("h"));
                }
                reallocChildSize($parent, ".dock-container.vertical");
            } else { // vertical
                if ($parent.children(".horizental").length > 0) { //big container
                    // console.log("dragsrc to be most top or bottom child of $parent");
                    var $newEle = createDockContainer("hbox");
                    var closestChild;
                    if ($(this).is(".dock-north")) {
                        closestChild = $parent.children().first();
                        closestChild.before($newEle).before(createSplitBar("h"));
                    } else {
                        closestChild = $parent.children().last();
                        closestChild.after($newEle).after(createSplitBar("h"));
                    }

                    $newEle.outerHeight(closestChild.outerHeight() / 2 - splitterbarWH);
                    closestChild.outerHeight(closestChild.outerHeight() - closestChild.outerHeight() / 2);
                    reallocChildSize($parent, ".dock-container.horizental");
                } else { //small container
                    // console.log("create a vertical container, put dragsrc and parent into it, dragsrc on top or bottom");
                    var $oldEle = createDockContainer("hbox");
                    $oldEle.append($parent.children());
                    $oldEle.outerHeight($parent.outerHeight() - $parent.outerHeight() / 2);
                    var $newEle = createDockContainer("hbox");
                    $newEle.outerHeight($parent.outerHeight() / 2 - splitterbarWH);

                    if ($(this).is(".dock-north")) {
                        $parent.append($newEle).append(createSplitBar("h")).append($oldEle);
                    } else {
                        $parent.append($oldEle).append(createSplitBar("h")).append($newEle);
                    }
                    reallocChildSize($parent, ".dock-container.horizental");
                }
            }
            $newEle.append(createTabPanel());
            moveTabPage($src, $newEle);
        }
        $(document).data("drag-src-id", null);
        initSplitBar();
        initDragAndDrop();
    });

    $(".dock-container").on("dragover", function (e) {
        e.preventDefault();
        if (typeof $(document).data("drag-src-id") == "undefined") {
            return;
        }
        var $target = $(e.target);
        //var parents = 
        var $parent = $target.parents(".dock-container").first();
        //parents.each(function (i) {
        //&& $(parents[i]).children(".tab-panel").length > 0
        //if (i === 0) { // first parent; and have tab-panel
        // console.log("drag over dockcontainer");
        //$parent = $(parents[i]);
        $(".dock-sn").css({
            display: "flex",
            left: $parent.offset().left + $parent.outerWidth() / 2 - 15, // 15 represents half of dock-nav
            top: $parent.offset().top,
            height: $parent.outerHeight()
        });
        $(".dock-ew").css({
            display: "flex",
            left: $parent.offset().left,
            top: $parent.offset().top + $parent.outerHeight() / 2 - 15, //same as above
            width: $parent.outerWidth()
        });

        if ($parent.children(".tab-panel").length > 0) {
            $(".dock-center").css("display", "flex");
        } else {
            $(".dock-center,.dock-cover").css("display", "none");
        }

        $(document).data("drop-dock-bound", {
            left: $parent.offset().left, top: $parent.offset().top,
            width: $parent.outerWidth(), height: $parent.outerHeight()
        });
        $(document).data("drop-dock-ref", $parent);
        return;
        //} // endif
        //$(".dock-nav").clone().
        //});//end each
    });

    $(".dock-container").on("drop", (function (e) {
        e.preventDefault();
    }));

    // toggle the tab-header
    $(".panel-header-list .tab").click(function () {
        if ($(this).hasClass('active'))
            return;
        var id = $(this).data("target");
        $(this).addClass('active');
        $(this).siblings().removeClass('active');
        $('#' + id).siblings().removeClass('active');
        $('#' + id).addClass('active');
    });

    // start app
    reallocChildSize($("#root"), ".dock-container.horizental");
};
// })(jQuery);
function initDocklayout() {
    $("dock-control > div").unwrap();
    init();
    // initSplitBar();
    // initDragAndDrop();
    // var child = $(document.body).children(".dock-container");
    // if (child.is(".vertical"))
    //     reallocChildSize(child, ".dock-container.horizental");
    // else
    //     reallocChildSize(child, ".dock-container.vertical");
}
exports.init = initDocklayout;