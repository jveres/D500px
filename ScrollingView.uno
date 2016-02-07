using Uno;
using Uno.Collections;
using Uno.UX;
using Fuse;
using Fuse.Controls;
using ImageView;
using WhileRebounced;

public class ScrollingView : ScrollView
{
        bool _done = true;
        String _url;

        public string ScrollToUrl
        {
                get { return ""; }
                set
                {
                        if (value != null)
                        {
                                _done = false; 
                                _url = value;
                                VisitSubtree(_scrollToUrlAction);
                        }
                }
        }

        void _scrollToUrlAction(Node n)
        {
                if (_done) return;
                if (n is ImageView)
                {
                        var imageView = n as ImageView;
                        if (_url == "" || imageView.ImageUrl == _url) // empty Url means the first ImageView
                        {
                                imageView.BringIntoView();
                                _done = true;
                                return;
                        }
                }
        }

        
}