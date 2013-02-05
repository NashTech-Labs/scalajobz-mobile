package com.knoldus.scalaJobz;

import org.apache.cordova.DroidGap;
import org.apache.cordova.*;
import com.knoldus.scalaJobz.R;

import android.os.Bundle;
import android.view.Menu;
import android.view.View;
import android.widget.TextView;

public class ScalaJobzActivity extends DroidGap {

    @Override
	public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        super.loadUrl("file:///android_asset/www/index.html");
        
        // set scrollbar style
       
//        setContentView(R.layout.activity_main);
//        TextView tv_View = (TextView)findViewById(R.id.editText1);
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.activity_main, menu);
        return true;
    }
    
}
