/**
 * misc.js
 * @version 0.21 (2014/3/2)
 * @author <a href="http://www20.atpages.jp/katwat/wp/">katwat</a>
 */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. 
 */

(function() {

"use strict";

var EventMonitor, BinaryStream;

EventMonitor = function() {
	var count, done;
	this.add = function( callback ) {
		if ( callback ) {
			done = callback;
			count = 0;
		}
		count++; // capture
	};
	this.del = function() {
		count--; // bubble
		if ( count === 0 && done ) {
			done();
			done = undefined;
		}
	};
};

BinaryStream = function( buffer, endian ) {
	this.dv = new DataView( buffer );
	this.offset = 0;
	this.littleEndian = endian;
};
BinaryStream.prototype.readInt8 = function() {
	var begin = this.offset;
	this.offset += 1;
	return this.dv.getInt8( begin );
};
BinaryStream.prototype.readUint8 = function() {
	var begin = this.offset;
	this.offset += 1;
	return this.dv.getUint8( begin );
};
BinaryStream.prototype.readInt16 = function() {
	var begin = this.offset;
	this.offset += 2;
	return this.dv.getInt16( begin, this.littleEndian );
};
BinaryStream.prototype.readUint16 = function() {
	var begin = this.offset;
	this.offset += 2;
	return this.dv.getUint16( begin, this.littleEndian );
};
BinaryStream.prototype.readInt32 = function() {
	var begin = this.offset;
	this.offset += 4;
	return this.dv.getInt32( begin, this.littleEndian );
};
BinaryStream.prototype.readUint32 = function() {
	var begin = this.offset;
	this.offset += 4;
	return this.dv.getUint32( begin, this.littleEndian );
};
BinaryStream.prototype.readFloat32 = function() {
	var begin = this.offset;
	this.offset += 4;
	return this.dv.getFloat32( begin, this.littleEndian );
};
BinaryStream.prototype.readBuffer = function( length ) {
	var begin = this.offset;
	this.offset += length;
	return this.dv.buffer.slice( begin, this.offset );
};
BinaryStream.prototype.readBytes = function( length ) {
	return new Uint8Array( this.readBuffer( length ) );
};

window.Misc = {
	load: function( url, type, onload, onerror, onprogress ) {
		var xhr;
		xhr = new XMLHttpRequest(); // require level 2
		xhr.onload = function() {
			if ( xhr.status === 200 ) { // OK
				onload( xhr ); // see: xhr.response
			} else {
				console.error( url, xhr.statusText );
				if ( onerror ) {
					onerror( xhr );
				}
			}
		};
		if ( onerror ) {
			xhr.onerror = function() {
				onerror( xhr );
			};
			xhr.ontimeout = function() {
				onerror( xhr );
			};
		}
		if ( onprogress ) {
			xhr.onprogress = function( e ) { // e: XMLHttpRequestProgressEvent
				onprogress( e ); // see: e.loaded, e.total
			};
		}
		xhr.open( 'GET', url, true );
		xhr.responseType = type; // set type after opened !
		xhr.send();
	},

	// 動作はするが短時間に多発させるのは好ましくない感じがする・・・ブラウザに負荷かかる感じ。
	// encoding.js を利用させてもらう方が賢明かも(^_^;)
	// -> http://polygon-planet-log.blogspot.jp/2012/04/javascript.html
	/* parseString: function( src, encoding, onparse ) {
		// src = Blob, String, ArrayBuffer or TypedArray
		var fr;
		if ( !( src instanceof Blob ) ) { // memo: src = new Blob( [ content ], { type: mime } );
			src = new Blob( [ src ] );
		}
		if ( src.size === 0 ) {
			onparse( '' );
			return;
		}
		fr = new FileReader();
		fr.onload = function() {
			onparse( fr.result );
		};
		fr.readAsText( src, encoding );
	}, */

	extractPathBase: function( path ) {
		var a = path.split( '/' );
		a.pop();
		return a.length === 0 ? '' : a.join( '/' ) + '/';
	},
	extractPathExt: function( path ) {
		var ext = path.split( '.' ).pop();
		if ( ext === path ) {
			return '';
		}
		return ext;
	},
	EventMonitor: EventMonitor,
	BinaryStream: BinaryStream
};

}());
