/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const withMDX = require('@next/mdx')();

/** @type {import('next').NextConfig} */
const nextConfig = {
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')]
  }
};

module.exports = withMDX(nextConfig);
