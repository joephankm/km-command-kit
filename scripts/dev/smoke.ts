import { style, styleCode } from '@/utils/shellStyle';

console.log(style.info('info message'));
console.log(style.heading('heading text'));
console.log(style.delete('delete text'));

console.log(styleCode('blue'));
console.log(styleCode('redBg'));
console.log(styleCode('bold', 'underline', 'cyan'));
console.log(styleCode('resetAll'));
console.log(styleCode('resetBoldOrDim'));
