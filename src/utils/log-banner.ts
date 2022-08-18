import {makeLines} from 'nodesplash';
import {readPackageSync} from 'read-pkg';

const logBanner = () => {
  console.log(makeLines({
    user: 'codetheweb',
    repository: 'muse',
    version: readPackageSync().version,
    paypalUser: 'codetheweb',
    githubSponsor: 'codetheweb',
    madeByPrefix: '用 🎶 製作 ',
    buildDate: process.env.BUILD_DATE ? new Date(process.env.BUILD_DATE) : undefined,
    commit: process.env.COMMIT_HASH ?? '未知',
  }).join('\n'));
  console.log('\n');
};

export default logBanner;
