import { draw, style, styleCode } from '@/utils/shellStyle';

console.log('--- styling');
console.log(style.info('Info message'));
console.log(style.emphasize('bold ' + style.error('and red') + ' still bold'));
console.log(JSON.stringify(style.border()), JSON.stringify(style.title('Report', style.border())));
console.log(styleCode('bold', 'underline', 'cyan'), styleCode('bgRed'), styleCode('resetColor'));

console.log('--- drawing');
draw.line(23, { title: 'Report' });

const box = draw.buildBox([12, 8], { thickOutline: true });

box.top();
box.row(['Name', 'Size'], { style: style.title });
box.mid();
box.row(['a.ts', { content: '4 KB', align: 'right' }]);
box.bot();
