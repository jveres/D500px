using Uno;
using Uno.Collections;
using Uno.UX;
using Fuse;
using Fuse.Controls;
using ImageView;

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
                        if (imageView.ImageUrl == _url || _url == "")
                        {
                                imageView.BringIntoView();
                                _done = true;
                                return;
                        }
                }
        }
}