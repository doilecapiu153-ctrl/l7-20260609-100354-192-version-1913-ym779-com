(function () {
    var container = document.querySelector('[data-search-results]');
    var heading = document.querySelector('[data-search-heading]');

    if (!container) {
        return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var items = window.SEARCH_ITEMS || [];

    function createCard(item) {
        var article = document.createElement('article');
        article.className = 'movie-card';

        var link = document.createElement('a');
        link.className = 'poster-link';
        link.href = item.url;

        var frame = document.createElement('span');
        frame.className = 'poster-frame';

        var image = document.createElement('img');
        image.src = './' + item.image;
        image.alt = item.title;
        image.loading = 'lazy';
        image.addEventListener('error', function () {
            image.style.display = 'none';
        }, { once: true });

        var year = document.createElement('span');
        year.className = 'poster-year';
        year.textContent = item.year;

        frame.appendChild(image);
        frame.appendChild(year);
        link.appendChild(frame);

        var body = document.createElement('div');
        body.className = 'movie-card-body';

        var title = document.createElement('h3');
        var titleLink = document.createElement('a');
        titleLink.href = item.url;
        titleLink.textContent = item.title;
        title.appendChild(titleLink);

        var summary = document.createElement('p');
        summary.textContent = item.oneLine || item.summary;

        var meta = document.createElement('div');
        meta.className = 'movie-meta';

        var region = document.createElement('span');
        region.textContent = item.region;

        var type = document.createElement('span');
        type.textContent = item.type;

        meta.appendChild(region);
        meta.appendChild(type);
        body.appendChild(title);
        body.appendChild(summary);
        body.appendChild(meta);
        article.appendChild(link);
        article.appendChild(body);

        return article;
    }

    function searchableText(item) {
        return [
            item.title,
            item.region,
            item.type,
            item.year,
            item.genre,
            (item.tags || []).join(' '),
            item.oneLine,
            item.summary
        ].join(' ').toLowerCase();
    }

    if (!query) {
        heading.textContent = '搜索影片';
        container.innerHTML = '<div class="empty-state">输入片名、类型、地区或标签开始搜索</div>';
        return;
    }

    var lowerQuery = query.toLowerCase();
    var tokens = lowerQuery.split(/\s+/).filter(Boolean);
    var results = items.filter(function (item) {
        var text = searchableText(item);
        return tokens.every(function (token) {
            return text.indexOf(token) !== -1;
        });
    }).slice(0, 120);

    heading.textContent = '搜索结果：' + query;
    container.innerHTML = '';

    if (!results.length) {
        container.innerHTML = '<div class="empty-state">未找到相关影片</div>';
        return;
    }

    results.forEach(function (item) {
        container.appendChild(createCard(item));
    });
}());
