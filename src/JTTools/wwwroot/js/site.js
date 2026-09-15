
axios.defaults.baseURL = "/jtt";

// axios.defaults.baseURL = "https://jttools.smallchi.cn/jtt";

// axios.defaults.baseURL = "http://127.0.0.1:18889/jtt";

function hexToString(hexStr, encoding = 'utf-8') {
    // 移除空格和换行符
    hexStr = hexStr.replace(/\s+/g, '');

    // 将16进制字符串转换为字节数组
    let bytes = [];
    for (let i = 0; i < hexStr.length; i += 2) {
        bytes.push(parseInt(hexStr.substring(i, i + 2), 16));
    }

    // 使用 TextDecoder 解码
    let decoder = new TextDecoder(encoding);
    return decoder.decode(new Uint8Array(bytes));
}

/**
 * 初始化当前浏览器支持的编码
 * @param {*} e select元素
 */
function initEncoding(e) {
    [
        // 常见 UNICODE 系列
        "UTF-8", "UTF-16LE", "UTF-16BE", "UTF-32LE", "UTF-32BE",

        // 中文编码
        "GBK", "GB18030", "HZ-GB-2312", "BIG5",

        // 日文编码
        "SHIFT_JIS", "EUC-JP", "ISO-2022-JP",

        // 韩文编码
        "EUC-KR", "ISO-2022-KR",

        // 西欧、拉美等
        "ISO-8859-1", "ISO-8859-2", "ISO-8859-5", "ISO-8859-15", "WINDOWS-1250", "WINDOWS-1251", "WINDOWS-1252", "WINDOWS-1256",

        // 俄语、希腊语等
        "KOI8-R", "KOI8-U", "MACINTOSH", "X-MAC-CYRILLIC",

        // 其它
        "IBM866", "ISO-2022-CN", "WINDOWS-1254", "WINDOWS-874"
    ].forEach((enc) => {
        try {
            new TextDecoder(enc);
            e.append(new Option(enc, enc));
        } catch {
        }
    });
}

/*ref: https://kimi.moonshot.cn/  auto-generated code */
jQuery.fn.extend({
    autoHeight: function () {
        return this.each(function () {
            var $this = jQuery(this);
            if (!$this.attr('_initAdjustHeight')) {
                $this.attr('_initAdjustHeight', $this.outerHeight());
            }
            _adjustH(this).on('input', function () {
                _adjustH(this);
            });
        });
        function _adjustH(elem) {
            var $obj = jQuery(elem);
            return $obj.css({ height: $obj.attr('_initAdjustHeight'), 'overflow-y': 'hidden' })
                .height(elem.scrollHeight);
        }
    },
    addEncoding: function () {
        initEncoding(this);
    }
});

/**
 * 每日经典语录
 *
 * 按「日期」取模选一条：同一天打开看到的是同一句，第二天自动换。
 * 纯前端实现，不需要后端接口，也不需要联网。
 */
const DAILY_QUOTES = [
    { text: "千里之行，始于足下。", from: "《道德经》" },
    { text: "合抱之木，生于毫末；九层之台，起于累土。", from: "《道德经》" },
    { text: "知人者智，自知者明。", from: "《道德经》" },
    { text: "祸兮福之所倚，福兮祸之所伏。", from: "《道德经》" },
    { text: "天行健，君子以自强不息。", from: "《周易》" },
    { text: "地势坤，君子以厚德载物。", from: "《周易》" },
    { text: "不积跬步，无以至千里；不积小流，无以成江海。", from: "《荀子·劝学》" },
    { text: "锲而不舍，金石可镂。", from: "《荀子·劝学》" },
    { text: "学而不思则罔，思而不学则殆。", from: "《论语》" },
    { text: "三人行，必有我师焉。", from: "《论语》" },
    { text: "知之为知之，不知为不知，是知也。", from: "《论语》" },
    { text: "工欲善其事，必先利其器。", from: "《论语》" },
    { text: "士不可以不弘毅，任重而道远。", from: "《论语·泰伯》" },
    { text: "博学之，审问之，慎思之，明辨之，笃行之。", from: "《礼记·中庸》" },
    { text: "凡事预则立，不预则废。", from: "《礼记·中庸》" },
    { text: "玉不琢，不成器；人不学，不知道。", from: "《礼记·学记》" },
    { text: "穷则独善其身，达则兼善天下。", from: "《孟子·尽心上》" },
    { text: "天将降大任于是人也，必先苦其心志，劳其筋骨。", from: "《孟子·告子下》" },
    { text: "生于忧患，死于安乐。", from: "《孟子·告子下》" },
    { text: "路漫漫其修远兮，吾将上下而求索。", from: "屈原《离骚》" },
    { text: "盛年不重来，一日难再晨。及时当勉励，岁月不待人。", from: "陶渊明《杂诗》" },
    { text: "非淡泊无以明志，非宁静无以致远。", from: "诸葛亮《诫子书》" },
    { text: "业精于勤，荒于嬉；行成于思，毁于随。", from: "韩愈《进学解》" },
    { text: "长风破浪会有时，直挂云帆济沧海。", from: "李白《行路难》" },
    { text: "天生我材必有用，千金散尽还复来。", from: "李白《将进酒》" },
    { text: "会当凌绝顶，一览众山小。", from: "杜甫《望岳》" },
    { text: "位卑未敢忘忧国。", from: "陆游《病起书怀》" },
    { text: "纸上得来终觉浅，绝知此事要躬行。", from: "陆游《冬夜读书示子聿》" },
    { text: "问渠那得清如许？为有源头活水来。", from: "朱熹《观书有感》" },
    { text: "少年易老学难成，一寸光阴不可轻。", from: "朱熹《偶成》" },
    { text: "不畏浮云遮望眼，只缘身在最高层。", from: "王安石《登飞来峰》" },
    { text: "黑发不知勤学早，白首方悔读书迟。", from: "颜真卿《劝学》" },
    { text: "宝剑锋从磨砺出，梅花香自苦寒来。", from: "《警世贤文》" },
    { text: "有志者事竟成，破釜沉舟，百二秦关终属楚。", from: "《后汉书》" },
    { text: "海纳百川，有容乃大；壁立千仞，无欲则刚。", from: "林则徐" },
    { text: "苟利国家生死以，岂因祸福避趋之。", from: "林则徐" }
];

/**
 * 渲染页脚的「每日经典语录」
 */
function renderDailyQuote() {
    const $quote = $("#DailyQuote");

    // 页面上没有这个元素（比如换页）就直接跳过
    if ($quote.length === 0) {
        return;
    }

    const now = new Date();

    // 把当前「本地时间」换算成从 1970-01-01 起算的天数：
    // 同一天永远是同一个数字，跨天 +1，跨年也不会跳。
    const dayNumber = Math.floor((now.getTime() - now.getTimezoneOffset() * 60000) / 86400000);
    const quote = DAILY_QUOTES[dayNumber % DAILY_QUOTES.length];

    $("#DailyQuoteText").text(quote.text);
    $("#DailyQuoteAuthor").text(quote.from);
    $quote.prop("hidden", false);
}

/**
 * 请求期间给按钮加个转圈并禁用，避免用户以为没点上而狂点
 * @param {*} $btn 触发按钮
 * @param {*} promise axios 返回的 Promise
 */
function withLoading($btn, promise) {
    const original = $btn.html();

    $btn.prop("disabled", true).html(
        '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> 解析中…'
    );

    return promise.finally(function () {
        $btn.prop("disabled", false).html(original);
    });
}

/**
 * 出结果后滚动到结果区（只在结果还在屏幕下方时才滚，不打断已经看到的用户）
 * @param {*} $target 结果区的 jQuery 对象
 */
function scrollToResult($target) {
    if (!$target || $target.length === 0) {
        return;
    }

    // 减掉固定导航栏的高度，别让结果被挡在栏下面
    const top = $target.offset().top - 78;

    if (top > window.scrollY + 40) {
        window.scrollTo({ top: top, behavior: "smooth" });
    }
}

/**
 * 收集结果区里的文本，供「复制」按钮使用。
 * 目标既可以是单个 <pre>，也可以是装着多个 <pre> 的容器（JT808 的折叠面板）。
 */
function collectResultText($btn) {
    const $target = $($btn.attr("data-copy-target"));
    const parts = [];

    $target.each(function () {
        if (this.tagName === "PRE") {
            parts.push($(this).text());
        } else {
            $(this).find("pre").each(function () {
                parts.push($(this).text());
            });
        }
    });

    return parts
        .map(function (s) { return (s || "").replace(/\s+$/, ""); })
        .filter(function (s) { return s.length > 0; })
        .join("\n\n");
}

/**
 * 复制按钮的临时状态反馈（成功 / 失败），1.6 秒后恢复原样
 */
function flashButton($btn, ok) {
    if ($btn.data("flashing")) {
        return;
    }

    const original = $btn.html();

    $btn.data("flashing", true)
        .removeClass("btn-outline-secondary")
        .addClass(ok ? "btn-outline-success" : "btn-outline-danger")
        .html(ok
            ? '<i class="bi bi-check2"></i> 已复制'
            : '<i class="bi bi-x-lg"></i> 复制失败');

    setTimeout(function () {
        $btn.removeClass("btn-outline-success btn-outline-danger")
            .addClass("btn-outline-secondary")
            .html(original)
            .data("flashing", false);
    }, 1600);
}

/**
 * 记录每个输入框「上一次被自动填充的示例数据」。
 * 切换协议版本时，只在这个框还是示例数据（或空白）的情况下才覆盖，
 * 用户自己输入 / 粘贴的内容不会被冲掉。
 */
const autoFilledSamples = {};

/**
 * 把示例数据填进输入框，并记下「这是自动填的」
 */
function fillSample(selector, data) {
    autoFilledSamples[selector] = data;
    $(selector).val(data);
}

/**
 * 输入框当前的内容能不能被示例数据覆盖？
 * 空 → 可以；还等于上次自动填的示例 → 可以；否则说明用户改过 → 不可以。
 */
function canReplaceWithSample(selector) {
    const current = ($(selector).val() || "").trim();

    if (current === "") {
        return true;
    }

    const last = (autoFilledSamples[selector] || "").trim();
    return last !== "" && current === last;
}

$(document).ready(function () {
    const JT808HexData = "7E 02 00 00 26 12 34 56 78 90 12 00 7D 02 00 00 00 01 00 00 00 02 00 BA 7F 0E 07 E4 F1 1C 00 28 00 3C 00 00 18 10 15 10 10 10 01 04 00 00 00 64 02 02 00 7D 01 13 7E";
    const JT8082013ForceHexData = "7e0102400c01003000068109024a3130303330303030363831857e";
    const JT808JT1078HexData = "7E120523A204066657506200EB00020001015A00000023012012191042052012191050190000000000000000000101064446D10120121910221720121910420500000000000000000001010F1FE8EB0120121910023420121910221700000000000000000001010F182D5C0120121909471120121910015500000000000000000001010B38F2430120121909274020121909471100000000000000000001010F056DB40120121909080920121909274000000000000000000001010F0724380120121908483820121909080900000000000000000001010F0530AB0120121908290720121908483800000000000000000001010F05896C0120121908093720121908290700000000000000000001010F02CD3B0120121907500520121908093700000000000000000001010F056FEF0120121907303420121907500500000000000000000001010F043C3401201219072541201219073034000000000000000000010103C26C5F0120121907061120121907254100000000000000000001010F03F0C10120121906464220121907061100000000000000000001010F02F6330120121906271220121906464200000000000000000001010F02E43B0120121906074220121906271200000000000000000001010F033D670120121905481120121906074200000000000000000001010F088BF20120121905284120121905481100000000000000000001010F03F9FE0120121905091020121905284100000000000000000001010F05B1040120121904494020121905091000000000000000000001010F02B3540120121904301020121904494000000000000000000001010F0417B00120121904103920121904301000000000000000000001010F0538970120121903510820121904103900000000000000000001010F054E9E0120121903313820121903510800000000000000000001010F016ECB0120121903120820121903313800000000000000000001010F0333C00120121902523820121903120700000000000000000001010F029D230120121902330720121902523700000000000000000001010F0354E40120121902133720121902330700000000000000000001010F03303D0120121901540720121902133700000000000000000001010F04981E0120121901343720121901540700000000000000000001010F02AD940120121901150820121901343700000000000000000001010EFFD7CF0120121900553720121901150800000000000000000001010F07D9330120121900360720121900553700000000000000000001010F040E740C7E\n7E1205203804066657506200EC000200020120121900163320121900360700000000000000000001010F0CE4CD0120121900002220121900163300000000000000000001010C6F9E7B5D7E";
    const JT808YueBiaoHexData = "7E0200405C01000000000012345678913CC400000000008C0003015198CF06C158C5000801F200E52203151206110104000716E30302000014040000000015040000000016040000000017020000180300000025040000000030011F310117EF0D49249200000049249011000003DE7E\n7E0200405C01000000000012345678913CC400000000008C0003015198CF06C158C5000801F200E52203151206110104000716E30302000014040000000015040000000016040000000017020000180300000025040000000030011F310117EF0D49249200000049249011000003DE7E";
    const JT808GPS51HexData = "7e020000470412106280030233000000000000200201d365df072f15d500280000002d21091719155801040002a10f2a0200042b049203a46f520103eb06000100ce0a5730011b31010951080000000000000000ca7e";
    const JT19056UpHexData = "55 7A C4 00 00 00 EB";
    const JT19056DownHexData = "55 7A C4 00 14 00 20 03 25 10 26 01 20 03 25 10 26 01 00 00 12 34 00 12 34 56 A9";
    const JT905HexData = "7E02000023103456789012007D02000000010000000200BA7F0E07E4F11C003C002110152110100104000000640202007D01347E";
    const JTSBHexData = "30 31 63 64 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 61 6C 61 72 6D 2E 78 6C 73 78 00 00 00 01 00 00 00 05 01 02 03 04 05";
    const JT1078HexData = "30 31 63 64 81 E2 10 88 01 12 34 56 78 10 01 10 00 00 01 6B B3 92 CA 7C 02 80 00 28 00 2E 00 00 00 01 61 E1 A2 BF 00 98 CF C0 EE 1E 17 28 34 07 78 8E 39 A4 03 FD DB D1 D5 46 BF B0 63 01 3F 59 AC 34 C9 7A 02 1A B9 6A 28 A4 2C 08";
    const JT809HexData2011 = "5B 00 00 00 92 00 00 06 82 94 00 01 33 EF B8 01 00 00 00 00 00 27 0F D4 C1 41 31 32 33 34 35 00 00 00 00 00 00 00 00 00 00 00 00 00 02 94 01 00 00 00 5C 01 00 02 00 00 00 00 5A 01 AC 3F 40 12 3F FA A1 00 00 00 00 5A 01 AC 4D 50 03 73 6D 61 6C 6C 63 68 69 00 00 00 00 00 00 00 00 31 32 33 34 35 36 37 38 39 30 31 00 00 00 00 00 00 00 00 00 31 32 33 34 35 36 40 71 71 2E 63 6F 6D 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 BA D8 5D";
    const JT809HexData2019 = "5B 00 00 00 C9 00 00 06 82 17 00 01 34 15 F4 01 00 00 00 00 00 27 0F 00 00 00 00 5E 02 A5 07 B8 D4 C1 41 31 32 33 34 35 00 00 00 00 00 00 00 00 00 00 00 00 00 02 17 01 00 00 00 8B 01 02 03 04 05 06 07 08 09 10 11 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 E7 D3 5D";
    const HexTools = "68747470733a2f2f6a74746f6f6c732e736d616c6c6368692e636e\n68747470733a2f2f67707335312e636f6d2f232f6c6f67696e";
    var route_state = 0;
    var navbarCollapse = new bootstrap.Collapse('#navbarCollapse', {
        toggle: false
    });
    fillSample("#JT808_Hex", JT808HexData);
    fillSample("#JT809_Hex", JT809HexData2011);
    fillSample("#JT19056_Hex", JT19056UpHexData);
    $("#JT905_Hex").val(JT905HexData);
    $("#JTSB_Hex").val(JTSBHexData);
    $("#JT1078_Hex").val(JT1078HexData);
    $("#HexTools").val(HexTools);
    $("#HexToolsEncoding").addEncoding()

    window.addEventListener('load', function () {
        console.log('load location: ', document.location, 'state: ', event.state);
        var MenuTypeHash = window.location.hash;
        if (MenuTypeHash) {
            console.log(MenuTypeHash);
            $("#menus>li a").removeClass('active');
            $("#menus>li a[menu-type=" + MenuTypeHash.substring(1) + "]").addClass('active');
            $("#main>div.container").hide();
            $("#main>div.container").removeClass("hide");
            $(MenuTypeHash).fadeIn();
            navbarCollapse.hide();
        }
    });

    /* 使用history API和监听popstate事件 */
    window.addEventListener('popstate', function (event) {
        if (route_state == 1) {
            route_state = 0;
            return;
        }
        console.log('popstate location: ', document.location, 'state: ', event.state);
        var MenuTypeHash = window.location.hash;
        if (MenuTypeHash) {
            console.log(MenuTypeHash);
            $("#menus>li a").removeClass('active');
            $("#menus>li a[menu-type=" + MenuTypeHash.substring(1) + "]").addClass('active');
            $("#main>div.container").hide();
            $("#main>div.container").removeClass("hide");
            $(MenuTypeHash).fadeIn();
            navbarCollapse.hide();
        }
    });

    $("#menus>li a").on("click", function () {
        route_state = 1;
        $("#menus>li a").removeClass('active');
        $(this).addClass('active');
        var currentMenuType = $(this).attr("menu-type");
        // console.debug(currentMenuType);
        // console.debug($("#main>div.container"));
        $("#main>div.container").hide();
        $("#main>div.container").removeClass("hide");
        $("#" + currentMenuType).fadeIn();
        navbarCollapse.hide();
    });

    $("#JT808_ProtocolType").on("change", function () {
        var protocolType = $(this).val();
        var hexData = JT808HexData;
        if ("JT808_JT1078" == protocolType) {
            hexData = JT808JT1078HexData;
        }
        else if ("JT808_YueBiao" == protocolType) {
            hexData = JT808YueBiaoHexData;
        }
        else if ("JT2013Force" == protocolType) {
            hexData = JT8082013ForceHexData;
        }
        else if ("JT808_GPS51" == protocolType) {
            hexData = JT808GPS51HexData;
        }
        // 用户已经输入 / 粘贴了自己的数据时不要冲掉，
        // 只在他没改过（还是示例数据，或者已经清空）时才填示例
        if (canReplaceWithSample("#JT808_Hex")) {
            fillSample("#JT808_Hex", hexData);
            $("#JT808_Hex").autoHeight();
        }
    });

    $("#JT809_ProtocolType").on("change", function () {
        var selectedValue = $(this).val();
        var hexData = (selectedValue == "2011") ? JT809HexData2011 : JT809HexData2019;

        // 用户已经输入 / 粘贴了自己的数据时不要冲掉
        if (canReplaceWithSample("#JT809_Hex")) {
            fillSample("#JT809_Hex", hexData);
        }

        // 协议版本换了，旧结果就失效了
        $("#JT809_Result").text("");
    });

    $("#JT809_EncryptType").on("change", function () {
        var selectedValue = $(this).val();
        if (selectedValue == "none") {
            $("#JT809_Encrypt_Group").fadeOut();
        } else {
            $("#JT809_Encrypt_Group").fadeIn();
        }
    });

    $("#JT19056_ProtocolType").on("change", function () {
        var selectedValue = $(this).val();
        var hexData = (selectedValue == "up") ? JT19056UpHexData : JT19056DownHexData;

        // 用户已经输入 / 粘贴了自己的数据时不要冲掉
        if (canReplaceWithSample("#JT19056_Hex")) {
            fillSample("#JT19056_Hex", hexData);
        }

        // 上下行换了，旧结果就失效了
        $("#JT19056_Result").text("");
    });

    $("#HexToolsConvert").on("click", function () {
        let encoding = $("#HexToolsEncoding").val();
        var hexLines = $("#HexTools").val().split('\n');
        var hexStr = "";
        if (hexLines) {
            for (var i = 0; i < hexLines.length; i++) {
                var hex = hexToString(hexLines[i], encoding);
                hexStr += hex + "\n";
            }
        }
        $("#HexToolsResult").val(hexStr);
    });

    $("#HexToolsDemo").on("click", function () {
        $("#HexTools").val(HexTools);
    });

    $("#HexToolsClear").on("click", function () {
        $("#HexTools").val("");
        $("#HexToolsResult").val("");
    });

    $("#JT808_Parse").on("click", function () {
        withLoading($(this), axios.post("/JT808/Analyze",
            {
                Hex: $("#JT808_Hex").val(),
                ProtocolType: $("#JT808_ProtocolType").val()
            })).then((res) => {
                if (res.data.Code == 200) {
                    $('#JT808_Accordion_Result').html("");
                    if (res.data.Result.Packages) {
                        if (res.data.Result.IsSubpackage) {
                            $.each(res.data.Result.Packages, function (index, item) {
                                var accordionHeader_content = '';
                                accordionHeader_content += '<span class="badge text-bg-primary">终端号：' + item.TerminalPhoneNo + '</span>';
                                accordionHeader_content += '<span class="badge text-bg-secondary">消息Id：' + item.MsgId + '</span>';
                                accordionHeader_content += '<span class="badge text-bg-success">消息流水号：' + item.MsgNum + '</span>';
                                accordionHeader_content += '<span class="badge text-bg-danger">设备版本号：' + item.ProtocolVersion + '</span>';
                                accordionHeader_content += '<span class="badge text-bg-warning">总分包数：' + item.PackgeCount + '</span>';
                                accordionHeader_content += '<span class="badge text-bg-info">当前页：' + item.PackageIndex + '</span>';
                                accordionHeader_content += '<span class="badge text-bg-dark">数据体长度：' + item.DataLength + '</span>';
                                accordionHeader_content += '<span class="badge text-bg-light">是否加密：' + (item.Encrypt ? '是' : '否') + '</span>';
                                var accordionHeader = '<h2 class="accordion-header"><button class="accordion-button" type="button" data-bs-target="#collapse' + index + '" aria-expanded="false" aria-controls="collapse' + index + '">' + '序号:' + item.Order + accordionHeader_content + '</button></h2>';
                                var accordionBody = '<div id="collapse' + index + '" class="accordion-collapse collapse"><div class="accordion-body"><pre>' + item.Body + '</pre></div></div>';
                                var accordionItem = '<div class="accordion-item">' + accordionHeader + accordionBody + '</div>';
                                $('#JT808_Accordion_Result').append(accordionItem);
                            });
                            var index = res.data.Result.Packages.length + 1;
                            var accordionHeader = '<h2 class="accordion-header"><button class="accordion-button" type="button" data-bs-target="#collapse' + index + '" aria-expanded="false" aria-controls="collapse' + index + '">' + '合并数据体' + '</button></h2>';
                            var accordionBody = '<div id="collapse' + index + '" class="accordion-collapse collapse"><div class="accordion-body"><pre>' + res.data.Result.JsonValue + '</pre></div></div>';
                            var accordionItem = '<div class="accordion-item">' + accordionHeader + accordionBody + '</div>';
                            $('#JT808_Accordion_Result').append(accordionItem);
                        } else {
                            $.each(res.data.Result.Packages, function (index, item) {
                                if (item.PackgeCount > 0) {
                                    var accordionHeader_content = '';
                                    accordionHeader_content += '<span class="badge text-bg-primary">终端号：' + item.TerminalPhoneNo + '</span>';
                                    accordionHeader_content += '<span class="badge text-bg-secondary">消息Id：' + item.MsgId + '</span>';
                                    accordionHeader_content += '<span class="badge text-bg-success">消息流水号：' + item.MsgNum + '</span>';
                                    accordionHeader_content += '<span class="badge text-bg-danger">设备版本号：' + item.ProtocolVersion + '</span>';
                                    accordionHeader_content += '<span class="badge text-bg-warning">总分包数：' + item.PackgeCount + '</span>';
                                    accordionHeader_content += '<span class="badge text-bg-info">当前页：' + item.PackageIndex + '</span>';
                                    accordionHeader_content += '<span class="badge text-bg-dark">数据体长度：' + item.DataLength + '</span>';
                                    accordionHeader_content += '<span class="badge text-bg-light">是否加密：' + (item.Encrypt ? '是' : '否') + '</span>';
                                    var accordionHeader = '<h2 class="accordion-header"><button class="accordion-button" type="button" data-bs-target="#collapse' + index + '" aria-expanded="false" aria-controls="collapse' + index + '">' + '序号:' + item.Order + accordionHeader_content + '</button></h2>';
                                    var accordionBody = '<div id="collapse' + index + '" class="accordion-collapse collapse"><div class="accordion-body"><pre>' + item.Body + '</pre></div></div>';
                                    var accordionItem = '<div class="accordion-item">' + accordionHeader + accordionBody + '</div>';
                                    $('#JT808_Accordion_Result').append(accordionItem);
                                } else {
                                    var accordionHeader = '<h2 class="accordion-header"><button class="accordion-button" type="button" data-bs-target="#collapse' + index + '" aria-expanded="false" aria-controls="collapse' + index + '">' + '序号:' + item.Order + '</button></h2>';
                                    var accordionBody = '<div id="collapse' + index + '" class="accordion-collapse collapse"><div class="accordion-body"><pre>' + item.JsonValue + '</pre></div></div>';
                                    var accordionItem = '<div class="accordion-item">' + accordionHeader + accordionBody + '</div>';
                                    $('#JT808_Accordion_Result').append(accordionItem);
                                }
                            });
                        }
                        // 只展开第一个，多包时结果区不会一下子拉得很长
                        const $firstCollapse = $('#JT808_Accordion_Result div.accordion-collapse').first();
                        $firstCollapse.addClass('show');
                        $firstCollapse.prev('.accordion-header')
                            .find('.accordion-button')
                            .removeClass('collapsed')
                            .attr('aria-expanded', 'true');

                        scrollToResult($('#JT808_Accordion_Result'));
                    } else {
                        $('#JT808_Accordion_Result').html('<div class="alert alert-warning mb-0">处理异常，请检测对应 Hex 数据包。</div>');
                    }

                } else {
                    $("#JT808_Accordion_Result").html('<div class="alert alert-warning mb-0">' + res.data.Message + '</div>');
                }
            })
            .catch(function (err) {
                console.error(err);
                $("#JT808_Accordion_Result").html('<div class="alert alert-danger mb-0">请求失败，请检查网络后重试。</div>');
            });
    });

    $("#JT809_Parse").on("click", function () {
        withLoading($(this), axios.post("/JT809/Analyze",
            {
                Hex: $("#JT809_Hex").val(),
                ProtocolType: $("#JT809_ProtocolType").val(),
                IsEncrypt: $("#JT809_EncryptType").val() != "none",
                M1: parseInt($("#JT809_M1_Value").val()),
                IA1: parseInt($("#JT809_IA1_Value").val()),
                IC1: parseInt($("#JT809_IC1_Value").val()),
            })).then((res) => {
                if (res.data.Code == 200) {
                    $("#JT809_Result").text(res.data.Result.JsonValue);
                    scrollToResult($("#JT809_Result"));
                } else {
                    $("#JT809_Result").text(res.data.Message);
                }
            })
            .catch(function (err) {
                console.error(err);
                $("#JT809_Result").text("请求失败，请检查网络后重试。");
            });
    });

    $("#JT19056_Parse").on("click", function () {
        withLoading($(this), axios.post("/JT19056/Analyze",
            {
                Hex: $("#JT19056_Hex").val(),
                ProtocolType: $("#JT19056_ProtocolType").val()
            })).then((res) => {
                if (res.data.Code == 200) {
                    $("#JT19056_Result").text(res.data.Result.JsonValue);
                    scrollToResult($("#JT19056_Result"));
                } else {
                    $("#JT19056_Result").text(res.data.Message);
                }
            })
            .catch(function (err) {
                console.error(err);
                $("#JT19056_Result").text("请求失败，请检查网络后重试。");
            });
    });

    $("#JT905_Parse").on("click", function () {
        withLoading($(this), axios.post("/JT905/Analyze",
            {
                Hex: $("#JT905_Hex").val()
            })).then((res) => {
                if (res.data.Code == 200) {
                    $("#JT905_Result").text(res.data.Result.JsonValue);
                    scrollToResult($("#JT905_Result"));
                } else {
                    $("#JT905_Result").text(res.data.Message);
                }
            })
            .catch(function (err) {
                console.error(err);
                $("#JT905_Result").text("请求失败，请检查网络后重试。");
            });
    });

    $("#JTSB_Parse").on("click", function () {
        withLoading($(this), axios.post("/JTActiveSafety/Analyze",
            {
                Hex: $("#JTSB_Hex").val()
            })).then((res) => {
                if (res.data.Code == 200) {
                    $("#JTSB_Result").text(res.data.Result.JsonValue);
                    scrollToResult($("#JTSB_Result"));
                } else {
                    $("#JTSB_Result").text(res.data.Message);
                }
            })
            .catch(function (err) {
                console.error(err);
                $("#JTSB_Result").text("请求失败，请检查网络后重试。");
            });
    });

    $("#JT1078_Parse").on("click", function () {
        withLoading($(this), axios.post("/JT1078/Analyze",
            {
                Hex: $("#JT1078_Hex").val()
            })).then((res) => {
                if (res.data.Code == 200) {
                    $("#JT1078_Result").text(res.data.Result.JsonValue);
                    scrollToResult($("#JT1078_Result"));
                } else {
                    $("#JT1078_Result").text(res.data.Message);
                }
            })
            .catch(function (err) {
                console.error(err);
                $("#JT1078_Result").text("请求失败，请检查网络后重试。");
            });
    });

    // 「复制」按钮：用页面已经引入的 clipboard.js（它自带老浏览器 / 非 HTTPS 的兜底）
    if (window.ClipboardJS) {
        const resultClipboard = new ClipboardJS(".jt-copy-btn", {
            text: function (trigger) {
                return collectResultText($(trigger));
            }
        });

        resultClipboard.on("success", function (e) {
            e.clearSelection();
            flashButton($(e.trigger), true);
        });

        resultClipboard.on("error", function (e) {
            flashButton($(e.trigger), false);
        });
    }

    // 「清空」按钮：清掉对应输入框并聚焦，方便直接粘贴下一包
    $(document).on("click", ".jt-clear-btn", function () {
        $($(this).attr("data-clear-target")).val("").trigger("focus");
    });

    // 页脚「每日经典语录」
    renderDailyQuote();

});