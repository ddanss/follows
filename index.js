const clientId = 'o9ai1orr9lfs2r17tnwgz4hm6i5j6z';

async function getUserByName(name) {
    const r = await fetch('https://api.twitch.tv/helix/users?login=' + name, {
        method: 'GET',
        headers: {
            'Client-ID':clientId
        }
    });
    return r.json();
}

async function getFollowingById (user_id, after) {
    const r = await fetch('https://api.twitch.tv/helix/users/follows?from_id=' + user_id + (after ? '&after=' + after : ''), {
        method: 'GET',
        headers: {
            'Client-ID':clientId
        }
    })
    return r.json();
}

async function getUserById (user_id) {
    const r = await fetch('https://api.twitch.tv/kraken/users/' + user_id, {
        method: 'GET',
        headers: {
            'Client-ID':clientId,
            'Accept': 'application/vnd.twitchtv.v5+json'
        }
    })
    return r.json();
}

function getFollows(r, userId, userName, cursor) {
    getFollowingById(userId, cursor).then(async r => {
        if(document.currentName.toLowerCase() !== userName.toLowerCase()) {
            return;
        }
        const es = r.data.sort(function(a, b){ 
            return new Date(b.followed_at) - new Date(a.followed_at); 
        });
        for (i = 0; i < es.length; i++) {
            const e = es[i];
            const fDate = new Date(e.followed_at);
            if(document.currentName.toLowerCase() !== userName.toLowerCase()) {
                return;
            }
            const resp = await getUserById(e.to_id);
            if(document.currentName.toLowerCase() !== userName.toLowerCase()) {
                return;
            }
            const elem = document.getElementById('cont');
            var line = '<div>'
            line += '<a href="https://www.twitch.tv/' + resp.name + '">' + resp.display_name + '</a>';
            line += '\t(' + fDate.getFullYear() + '/' + (fDate.getMonth()+1) + '/' + fDate.getDate() +')';
            line +='</div>';
            elem.innerHTML += line;
        }
        console.log(r);
        if (es.length > 0 && r.pagination && r.pagination.cursor) {
            getFollows(r, userId, userName, r.pagination.cursor)
        }
    });
}

function populatePage(r) {
    if(r.data[0].profile_image_url) {
        const elem = document.getElementById('title');
        elem.innerHTML += '<img src="' + r.data[0].profile_image_url + '" />'
    }
    const userName = r.data[0].login;
    const userId = r.data[0].id;
    getFollows(r, userId, userName);
}

document.currentName = 'heehee1004';
getUserByName('heehee1004').then(populatePage);

document.getElementById("findButton").onclick = async function() {
    document.getElementById('title').innerHTML = '';
    document.getElementById('cont').innerHTML = '';
    
    const name = document.getElementById('name').value;
    document.currentName = name;
    const d = await getUserByName(name);
    if (d && d.data && d.data.length > 0) {
        populatePage(d)
    } else {
        document.getElementById('title').innerHTML = '<div>체크 아이디 플리즈</div>';
    }
}